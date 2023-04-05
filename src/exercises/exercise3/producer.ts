import { connect } from "amqplib";
import { random } from "lodash";

random();

export function wait(timeout: number) {
  return new Promise((res, _) => {
    return setTimeout(res, timeout);
  });
}

async function main() {
  const connection = await connect("amqp://localhost");
  const channel = await connection.createChannel();
  const exchangeName = "topicExchange";
  const args = process.argv.slice(2);
  const key = args.length > 0 ? args[0] : "anonymous.event";
  const message = args.slice(1).join(" ") || "Ciao";
  await channel.assertExchange(exchangeName, "topic");
  channel.publish(exchangeName, key, Buffer.from(message));
  console.log("Sent: " + message + ". Topic : " + key);
  await wait(1000);
  connection.close();
}

main().then(
  () => console.log("OK!"),
  err => console.log("Error: ", err)
);
