// src/controllers/publishMessageController.js
require('dotenv').config({ path: '.prod.env' });

const exchangeName = process.env.EXCHANGE_NAME;

// Function to publish a message to the RabbitMQ exchange
module.exports.publishMessage = async (channel, bindingKey, message) => {
  try {
    if (!channel) {
      throw new Error('RabbitMQ channel is not available');
    }

    // Publish the message to the specified exchange with a routing key
    channel.publish(exchangeName, bindingKey, Buffer.from(message), { persistent: true });
    console.log(`Message sent to exchange '${exchangeName}' with key '${bindingKey}': ${message}`);
  } catch (error) {
    console.error('Error publishing message:', error);
    throw error; // Rethrow to let the caller handle it if needed
  }
};
