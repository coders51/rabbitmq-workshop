import { connect } from "amqplib";
import { random } from "lodash";

random();

export function wait(timeout: number) {
  return new Promise((res, _) => {
    return setTimeout(res, timeout);
  });
}
async function main() {
  const connection = await connect("amqp://localhost");
  const channel = await connection.createChannel();
  const exchangeName = "shipmentExchange";
  await channel.assertExchange(exchangeName, "topic");
  const { queue: prepareOrdeNormalQueue } = await channel.assertQueue("prepareOrdeNormalQueue", {
    autoDelete: false,
    durable: true,
    arguments: { "x-queue-type": "quorum" },
  });
  const { queue: prepareOrderUrgentQueue } = await channel.assertQueue("prepareOrderUrgentQueue", {
    autoDelete: false,
    durable: true,
    arguments: { "x-queue-type": "quorum" },
  });
  const { queue: amendedQueue } = await channel.assertQueue("amendedQueue", {
    autoDelete: false,
    durable: true,
    arguments: { "x-queue-type": "quorum" },
  });
  channel.bindQueue(prepareOrdeNormalQueue, exchangeName, "prepare_order_normal");
  channel.bindQueue(prepareOrderUrgentQueue, exchangeName, "prepare_order_urgent");
  channel.bindQueue(amendedQueue, exchangeName, "amended_shipment");
  channel.consume(prepareOrdeNormalQueue, async msg => {
    if (!msg) return;
    const order = JSON.parse(msg.content.toString());
    await wait(random(1000, 5000));
    console.log(order.orderId, order.level);
    const message = { type: "order_shipped", orderId: order.orderId, level: order.level };
    const jsonMessage = JSON.stringify(message);
    const rk = "order_shipped";
    channel.publish(exchangeName, rk, Buffer.from(jsonMessage), { timestamp: Date.now() });
  });
  channel.consume(prepareOrderUrgentQueue, async msg => {
    if (!msg) return;
    const order = JSON.parse(msg.content.toString());
    console.log(order.orderId, order.level);
    const message = { type: "order_shipped", orderId: order.orderId, level: order.level };
    const jsonMessage = JSON.stringify(message);
    const rk = "order_shipped";
    channel.publish(exchangeName, rk, Buffer.from(jsonMessage), { timestamp: Date.now() });
  });
  channel.consume(amendedQueue, async msg => {
    if (!msg) return;
    const order = JSON.parse(msg.content.toString());
    console.log("shipment_amended", order.orderId, order.level);
    const message = { type: "shipment_amended", orderId: order.orderId };
    const jsonMessage = JSON.stringify(message);
    const rk = "shipment_amended";
    channel.publish(exchangeName, rk, Buffer.from(jsonMessage));
  });
}

main().then(
  () => console.log("Ok"),
  err => console.log("Error: ", err)
);
