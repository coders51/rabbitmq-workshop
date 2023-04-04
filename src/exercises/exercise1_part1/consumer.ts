import { connect, ConsumeMessage } from "amqplib";
import { random } from "lodash";

random();
export function yyz(m: ConsumeMessage) {
  console.log(m);
}

export function wait(timeout: number) {
  return new Promise((res, _) => {
    return setTimeout(res, timeout);
  });
}

async function main() {
  const connection = await connect("amqp://localhost");
  const channel = await connection.createChannel();
  const exchangeName = "exchangeDirect";
  await channel.assertExchange(exchangeName, "direct");
  const { queue } = await channel.assertQueue("", {
    autoDelete: true,
    durable: false,
  });
  console.log(
    " [*] Waiting for messages in " + queue + " - To exit press CTRL+C"
  );
  channel.bindQueue(queue, "exchangeDirect", "");
  channel.consume(queue, msg => console.log(msg?.content.toString()));
}

main().then(
  () => console.log("Program terminated!"),
  err => console.log("Error: ", err)
);
