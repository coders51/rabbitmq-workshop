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
  channel.bindQueue(queue, exchangeName, "prepare_order");
  channel.bindQueue(queue, exchangeName, "order_shipped");

  const startTimes = new Map<string, number>();

  channel.consume(queue, async msg => {
    if (!msg) {
      return;
    }
    const order = JSON.parse(msg.content.toString());
    if (order.type === "prepare_order") {
      console.log(`Order ${order.orderId} prepared.`);
      startTimes.set(order.orderId, Date.now());
    } else if (order.type === "order_shipped") {
      const startTime = startTimes.get(order.orderId);
      if (startTime) {
        const timeTaken = Date.now() - startTime;
        console.log(`Order ${order.orderId} shipped in ${timeTaken} ms.`);
        startTimes.delete(order.orderId);
      } else {
        console.log(`Unknown order ID: ${order.orderId}`);
      }
    }
  });
}

main().then(
  () => console.log("Ok"),
  err => console.log("Error: ", err)
);
