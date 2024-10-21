// src/config/rabbitmq.js
const amqp = require('amqplib/callback_api');
require('dotenv').config({ path: '.prod.env' });


// Load RabbitMQ configuration from environment variables
const rabbitmqUrl = process.env.RABBITMQ_URL;
const EXCHANGE_NAME = process.env.EXCHANGE_NAME;

let channel = null;
let connection = null;

// Function to connect to RabbitMQ and create a channel
const connectRabbitMQ = () => {
  amqp.connect(rabbitmqUrl, (error, conn) => {
    if (error) {
      console.error('Error connecting to RabbitMQ:', error);
      throw error; // Consider more graceful error handling in production
    }
    connection = conn;

    // Create a channel
    connection.createChannel((err, ch) => {
      if (err) {
        console.error('Error creating channel:', err);
        throw err; // Consider more graceful error handling in production
      }
      console.log('Connected to RabbitMQ successfully.');
      channel = ch;
      // channel checking
      console.log('channel', channel);
    });
  });
};

// Export the connectRabbitMQ function and channel functions
module.exports = {
  connectRabbitMQ,
  getChannel: () => channel,
  getConnection: () => connection,
};
