import { connect } from "amqplib";
import { random } from "lodash";

random();

export function wait(timeout: number) {
  return new Promise((res, _) => {
    return setTimeout(res, timeout);
  });
}
async function main() {
  const args = process.argv.slice(2);
  if (args.length == 0) {
    console.log(
      "You have to pass the topics in the args: <name>.<type>.<event>\n If you typed '#' for everything try with $#\n"
    );
    process.exit(1);
  }
  const connection = await connect("amqp://localhost");
  const channel = await connection.createChannel();
  const exchangeName = "topicExchange";
  await channel.assertExchange(exchangeName, "topic");
  const { queue } = await channel.assertQueue("", {
    autoDelete: true,
    durable: false,
  });
  args.forEach(function (key) {
    if (key === "$#") key = "#";
    channel.bindQueue(queue, exchangeName, key);
    console.log(
      " [*] Waiting for messages with topic: ",
      key,
      " - To exit press CTRL+C"
    );
  });
  channel.consume(queue, msg => console.log(msg?.content.toString()));
}

main().then(
  () => console.log("Ok"),
  err => console.log("Error: ", err)
);
