const express = require('express');
const bodyParser = require('body-parser');
require('dotenv').config({ path: '.prod.env' });

const courseRoutes = require('./routes/courseRoute');
const { consumeMessages } = require('./controllers/consumeMessageController');
const { connectRabbitMQ } = require('./config/rabbitmq');
const app = express();

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/api/courses', courseRoutes);

// Connect to RabbitMQ
connectRabbitMQ()
  .then(() => {
    // Start consuming messages for course registrations
    consumeMessages();

    // Set the port for the application
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
      console.log(`Course service is running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to RabbitMQ:', error);
    process.exit(1); // Exit the application if RabbitMQ connection fails
  });

module.exports = app;
