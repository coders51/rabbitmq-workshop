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
      rk: { type: "string", default: "rk1" },
    })
    .parseSync();
  console.log("consuming on queue: ", argv.queue);

  const connection = await connect("amqp://localhost");
  const channel = await connection.createChannel();
  const exchangeName = "exchangeDirect";
  await channel.assertExchange(exchangeName, "direct");
  const { queue } = await channel.assertQueue(`${argv.queue}`, {
    autoDelete: false,
    durable: true,
  });
  const rk = argv.rk;
  console.log(` [*] Waiting for messages in ${queue} - To exit press CTRL+C`);
  channel.bindQueue(queue, "exchangeDirect", rk);
  channel.consume(queue, msg => console.log(msg?.content.toString()));
}

main().then(
  () => console.log("Ok"),
  err => console.log("Error: ", err)
);
