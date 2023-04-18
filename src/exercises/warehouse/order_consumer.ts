import { connect } from "amqplib";
import { random } from "lodash";

random();

async function main() {
  const connection = await connect("amqp://localhost");
  const channel = await connection.createChannel();
  const exchangeName = "shipmentExchange";
  await channel.assertExchange(exchangeName, "topic");
  const { queue: insertedOrderQueue } = await channel.assertQueue("insertedOrderQueue", {
    autoDelete: false,
    durable: true,
    arguments: { "x-queue-type": "quorum" },
  });
  const { queue: amendedOrderQueue } = await channel.assertQueue("amendedOrderQueue", {
    autoDelete: false,
    durable: true,
    arguments: { "x-queue-type": "quorum" },
  });
  channel.bindQueue(insertedOrderQueue, exchangeName, "order_inserted");
  channel.bindQueue(amendedOrderQueue, exchangeName, "order_amended");
  channel.consume(insertedOrderQueue, msg => {
    if (!msg) return;
    const order = JSON.parse(msg.content.toString());
    const message = { type: "prepare_order", orderId: order.orderId, level: order.level, total: order.total };
    console.log(message);
    const jsonMessage = JSON.stringify(message);
    const rk = "prepare_order_" + order.level;
    channel.publish(exchangeName, rk, Buffer.from(jsonMessage), { timestamp: Date.now() });
  });
  channel.consume(amendedOrderQueue, msg => {
    if (!msg) return;
    const order = JSON.parse(msg.content.toString());
    const message = { type: "amended_shipment", orderId: order.orderId, level: order.level, total: order.total };
    console.log(message);
    const jsonMessage = JSON.stringify(message);
    const rk = "amended_shipment";
    channel.publish(exchangeName, rk, Buffer.from(jsonMessage));
  });
}

main().then(
  () => console.log("Ok"),
  err => console.log("Error: ", err)
);
