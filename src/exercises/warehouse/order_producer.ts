import { Channel, connect } from "amqplib";
import { random } from "lodash";
import { wait } from "./wait";

random();

async function sendAmendOrder(channel: Channel, exchangeName: string) {
  const orderId = random(1000, 10000);
  const level = random(1, 100) > 60 ? "urgent" : "normal";
  const total = random(1, 50);
  const message = { type: "order_amended", orderId: orderId, level: level, total: total };
  const jsonMessage = JSON.stringify(message);
  const rk = "order_amended";
  channel.publish(exchangeName, rk, Buffer.from(jsonMessage));
  console.log("Order amended");
}

async function sendOrderInserted(channel: Channel, exchangeName: string) {
  const orderId = random(1000, 10000);
  const level = random(1, 100) > 60 ? "urgent" : "normal";
  const total = random(1, 50);
  const message = { type: "order_inserted", orderId: orderId, level: level, total: total };
  const jsonMessage = JSON.stringify(message);
  const rk = "order_inserted";
  channel.publish(exchangeName, rk, Buffer.from(jsonMessage));
  console.log("New order inserted");
}
async function main() {
  const connection = await connect("amqp://localhost");
  const channel = await connection.createChannel();
  const exchangeName = "shipmentExchange";
  await channel.assertExchange(exchangeName, "topic");
  while (true) {
    if (random(1, 50) % 2 == 0) {
      await sendAmendOrder(channel, exchangeName);
    } else {
      await sendOrderInserted(channel, exchangeName);
    }
    await wait(1000);
  }
  await connection.close();
}

main().then(
  () => console.log("OK!"),
  err => console.log("Error: ", err)
);
