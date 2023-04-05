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
  const exchangeName = "fanoutExchange";
  await channel.assertExchange(exchangeName, "fanout");
  const { queue } = await channel.assertQueue("", {
    autoDelete: true,
    durable: false,
  });
  console.log(
    " [*] Waiting for messages in queue:" + queue + " - To exit press CTRL+C"
  );
  channel.bindQueue(queue, exchangeName, "");
  channel.consume(queue, msg => console.log(msg?.content.toString()));
}

main().then(
  () => console.log("Ok"),
  err => console.log("Error: ", err)
);
