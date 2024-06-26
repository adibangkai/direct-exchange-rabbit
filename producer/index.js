const express = require("express");
const amqp = require("amqplib");
const app = express();
const PORT = 3000;

app.use(express.json());

async function connectRabbitMQ() {
  try {
    const connection = await amqp.connect(
      process.env.RABBITMQ_URL || "amqp://rabbitmq"
    );
    const channel = await connection.createChannel();
    const exchange = "direct_logs";

    await channel.assertExchange(exchange, "direct", { durable: false });

    console.log("Terhubung ke RabbitMQ");
    return { connection, channel, exchange };
  } catch (error) {
    -console.error("Gagal terhubung ke RabbitMQ", error);
  }
}

app.post("/send", async (req, res) => {
  const { message, routingKey } = req.body;
  const { channel, exchange } = await connectRabbitMQ();

  channel.publish(exchange, routingKey, Buffer.from(message));
  console.log(`Pesan terkirim: ${message}`);

  res.send("Pesan terkirim");
});

app.listen(PORT, () => {
  console.log(`Producer berjalan di http://localhost:${PORT}`);
});
