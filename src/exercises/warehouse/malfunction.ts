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
  let total_amended = 0;
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
  channel.bindQueue(queue, exchangeName, "order_amended");
  channel.consume(queue, async msg => {
    if (!msg) {
      return;
    }
    const order = JSON.parse(msg.content.toString());
    if (order.type == "order_amended") total_amended++;
    console.log("Total amended orders: " + total_amended);
  });
}

main().then(
  () => console.log("Ok"),
  err => console.log("Error: ", err)
);
