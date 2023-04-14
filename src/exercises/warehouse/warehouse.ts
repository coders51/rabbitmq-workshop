import { connect } from "amqplib";
import { random } from "lodash";
import yargs from "yargs";

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
  const { queue: prepareOrderQueue } = await channel.assertQueue("prepareOrderQueue", {
    autoDelete: false,
    durable: true,
    arguments: { "x-queue-type": "quorum" },
  });
  const { queue: amendedShipmentQueue } = await channel.assertQueue("amendedShipmentQueue", {
    autoDelete: false,
    durable: true,
    arguments: { "x-queue-type": "quorum" },
  });
  channel.bindQueue(prepareOrderQueue, exchangeName, "order_inserted");
  channel.bindQueue(amendedShipmentQueue, exchangeName, "order_amended");
  channel.consume(prepareOrderQueue, async msg => {
    if (!msg) return;
    const order = JSON.parse(msg.content.toString());
    if (order.level === "normal") {
      await wait(random(1000, 5000));
    }
    console.log(order.orderId, order.level);
    const message = { type: "order_shipped", orderId: order.orderId, level: order.level };
    const jsonMessage = JSON.stringify(message);
    const rk = "order_shipped";
    channel.publish(exchangeName, rk, Buffer.from(jsonMessage));
  });
  channel.consume(amendedShipmentQueue, async msg => {
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
