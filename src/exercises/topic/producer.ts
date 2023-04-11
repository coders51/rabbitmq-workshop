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
      name: { type: "string", default: "topicName" },
      message: { type: "string", default: "Hello World" },
    })
    .parseSync();
  const connection = await connect("amqp://localhost");
  const channel = await connection.createChannel();
  const exchangeName = "topicExchange";
  await channel.assertExchange(exchangeName, "topic");
  let type = 0;
  let count = 0;
  let xxx = -1;
  while (true) {
    const rk = `${argv.name}.type${type + 1}.rk${count + 1}`;
    channel.publish(exchangeName, rk, Buffer.from(argv.message + rk));
    console.log("Sent:", argv.message, "- topic:", rk);
    await wait(1000);
    count = (count + 1) % 3;
    xxx = (xxx + 1) % 3;
    type = (type + Math.floor(xxx / 2)) % 3;
  }
  connection.close();
}

main().then(
  () => console.log("OK!"),
  err => console.log("Error: ", err)
);
