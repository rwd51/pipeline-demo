require('dotenv').config({ path: '.prod.env' });

const amqp = require('amqplib/callback_api');

const rabbitmqUrl = process.env.RABBITMQ_URL;
let channel = null;
let connection = null;

const connectRabbitMQ = () => {
  return new Promise((resolve, reject) => {
    amqp.connect(rabbitmqUrl, (error, conn) => {
      if (error) {
        console.error('Error connecting to RabbitMQ:', error);
        return reject(error);
      }
      connection = conn;
      // successful connection
      console.log('Connected to RabbitMQ');
      connection.createChannel((err, ch) => {
        if (err) {
          console.error('Error creating channel:', err);
          return reject(err);
        }
        channel = ch;
        // successful channel creation
        console.log('Channel created');
        resolve(channel); // Resolve the promise with the channel
      });
    });
  });
};

// Add this function to export the channel
const getChannel = () => channel;

// Export functions
module.exports = { connectRabbitMQ, getChannel, connection };
