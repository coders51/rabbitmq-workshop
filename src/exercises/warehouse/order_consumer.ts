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
  const argv = yargs(process.argv.slice(2))
    .options({
      queue: { type: "string", default: "q1" },
    })
    .parseSync();
  const connection = await connect("amqp://localhost");
  const channel = await connection.createChannel();
  const exchangeName = "shipmentExchange";
  await channel.assertExchange(exchangeName, "topic");
  const { queue } = await channel.assertQueue(argv.queue, {
    autoDelete: false,
    durable: true,
    arguments: { "x-queue-type": "quorum" },
  });
  channel.bindQueue(queue, exchangeName, "order_inserted");
  channel.bindQueue(queue, exchangeName, "order_amended");
  channel.consume(queue, msg => {
    if (!msg) {
      return;
    }
    const order = JSON.parse(msg.content.toString());
    if (order.type == "order_inserted") {
      let orderId = random(1000, 10000);
      let level = random(1, 100) > 60 ? "urgent" : "normal";
      const message = { type: "prepare_order", orderId: orderId, level: level };
      console.log(message);
      const jsonMessage = JSON.stringify(message);
      const rk = "prepare_order";
      channel.publish(exchangeName, rk, Buffer.from(jsonMessage));
    } else {
      let orderId = order.orderId;
      let level = random(1, 100) > 60 ? "urgent" : "normal";
      const message = { type: "amended_shipment", orderId: orderId, level: level };
      console.log(message);
      const jsonMessage = JSON.stringify(message);
      const rk = "amended_shipment";
      channel.publish(exchangeName, rk, Buffer.from(jsonMessage));
    }
  });
}

main().then(
  () => console.log("Ok"),
  err => console.log("Error: ", err)
);
