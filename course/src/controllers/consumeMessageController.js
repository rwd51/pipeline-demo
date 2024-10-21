const pool = require('../db'); // Import the pool
const { getChannel } = require('../config/rabbitmq');
require('dotenv').config({ path: '.prod.env' });

const queueName = process.env.QUEUE_NAME;

// Helper function to execute SQL queries
const query = async (text, params) => {
  const res = await pool.query(text, params);
  return res.rows;
};

exports.consumeMessages = () => {
  const channel = getChannel();

  if (!channel) {
    console.error('RabbitMQ channel is not available');
    return;
  }

  // Assert the queue (ensures the queue exists)
  channel.assertQueue(queueName, { durable: true });

  // Start consuming messages from the queue
  channel.consume(queueName, async (msg) => {
    if (msg !== null) {
      const { courseId, userId } = JSON.parse(msg.content.toString()); // Assuming courseId and userId are sent in the message
      console.log(`Received registration request for course ID: ${courseId}, user: ${userId}`);

      // Process the registration
      try {
        // Check if the student is already registered
        const checkRegistrationQuery = `
          SELECT * FROM course_registrations 
          WHERE student_id = $1 AND course_id = $2;
        `;
        const existingRegistration = await query(checkRegistrationQuery, [userId, courseId]);

        if (existingRegistration.length > 0) {
          console.log(`User ${userId} is already registered for course ID ${courseId}`);
        } else {
          // Register the student
          const registerStudentQuery = `
            INSERT INTO course_registrations (student_id, course_id) 
            VALUES ($1, $2) RETURNING *;
          `;
          await query(registerStudentQuery, [userId, courseId]);
          console.log(`User ${userId} successfully registered for course ID ${courseId}`);
        }

        // Acknowledge the message after successful processing
        channel.ack(msg);
      } catch (error) {
        console.error('Error registering user:', error);
        // Reject the message without requeueing
        channel.nack(msg, false, false);
      }
    }
  }, { noAck: false });  // Enable message acknowledgement
};