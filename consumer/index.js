const amqp = require("amqplib/callback_api");

const RABBITMQ_URL = process.env.RABBITMQ_URL || "amqp://rabbitmq";

const connectToRabbitMQ = () => {
  amqp.connect(RABBITMQ_URL, (err, connection) => {
    if (err) {
      console.error("Failed to connect to RabbitMQ:", err.message);
      setTimeout(connectToRabbitMQ, 5000); // Retry after 5 seconds
      return;
    }

    // Consumer for "notification"
    connection.createChannel((err, channelNotification) => {
      if (err) {
        throw err;
      }
      const exchange = "direct_logs";
      const queue = "test_queue_notification";
      const routingKey = "notification";

      channelNotification.assertExchange(exchange, "direct", {
        durable: false,
      });
      channelNotification.assertQueue(
        queue,
        { durable: false },
        function (error2, q) {
          if (error2) {
            throw error2;
          }
          console.log(
            " [*] Waiting for messages in %s. To exit press CTRL+C",
            q.queue
          );

          channelNotification.bindQueue(q.queue, exchange, routingKey);

          channelNotification.consume(
            q.queue,
            function (msg) {
              if (msg.content) {
                console.log(
                  " [x] Received %s with routing key %s",
                  msg.content.toString(),
                  msg.fields.routingKey
                );
              }
            },
            { noAck: true }
          );
        }
      );
    });

    // Consumer for "pengumuman"
    connection.createChannel((err, channelPengumuman) => {
      if (err) {
        throw err;
      }
      const exchange = "direct_logs";
      const queue = "test_queue_pengumuman";
      const routingKey = "pengumuman";

      channelPengumuman.assertExchange(exchange, "direct", { durable: false });
      channelPengumuman.assertQueue(
        queue,
        { durable: false },
        function (error2, q) {
          if (error2) {
            throw error2;
          }
          console.log(
            " [*] Waiting for messages in %s. To exit press CTRL+C",
            q.queue
          );

          channelPengumuman.bindQueue(q.queue, exchange, routingKey);

          channelPengumuman.consume(
            q.queue,
            function (msg) {
              if (msg.content) {
                console.log(
                  " [x] Received %s with routing key %s",
                  msg.content.toString(),
                  msg.fields.routingKey
                );
              }
            },
            { noAck: true }
          );
        }
      );
    });
  });
};

connectToRabbitMQ();
