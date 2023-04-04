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

//argument -> key [1, 2, 3]
async function main() {
  const args = process.argv.slice(2);
  var key = args.length == 1 ? args[0] : "";
  const connection = await connect("amqp://localhost");
  const channel = await connection.createChannel();
  const exchangeName = "exchangeDirect";
  await channel.assertExchange(exchangeName, "direct");
  const { queue } = await channel.assertQueue("", {
    autoDelete: true,
    durable: false,
  });
  console.log(
    " [*] Waiting for messages in queue:" +
      queue +
      ", key: " +
      key +
      " - To exit press CTRL+C"
  );
  channel.bindQueue(queue, exchangeName, key);
  channel.consume(queue, msg => console.log(msg?.content.toString()));
}

main().then(
  () => console.log("Ok"),
  err => console.log("Error: ", err)
);
