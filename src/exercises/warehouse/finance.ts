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
  let total_amount = 0;
  const argv = yargs(process.argv.slice(2))
    .options({
      queue: { type: "string", default: "financeStream" },
    })
    .parseSync();
  const connection = await connect("amqp://localhost");
  const channel = await connection.createChannel();
  const exchangeName = "shipmentExchange";
  await channel.assertExchange(exchangeName, "topic");
  const { queue } = await channel.assertQueue(argv.queue, {
    durable: true,
    exclusive: false,
    autoDelete: false,
    arguments: { "x-queue-type": "stream" },
  });
  channel.bindQueue(queue, exchangeName, "prepare_order");
  await channel.prefetch(1);
  channel.consume(
    queue,
    async msg => {
      if (!msg) {
        return;
      }
      const order = JSON.parse(msg.content.toString());
      total_amount += order.total;
      console.log("Total inserted: " + total_amount);
      channel.ack(msg, false);
    },
    { arguments: { "x-stream-offset": "first" } }
  );
}

main().then(
  () => console.log("Ok"),
  err => console.log("Error: ", err)
);
