const { QueueClient, QueueServiceClient } = require("@azure/storage-queue");

const queueName = "new-file-queue"
const connectionString = "";
const maxWait = 32;

function delay(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function main(){
	const queueServiceClient = QueueServiceClient.fromConnectionString(connectionString);
	const queueClient = queueServiceClient.getQueueClient(queueName);
	await queueClient.create();		
	
	var wait = 1;

	while(1==1){
		const receivedMsgsResp = await queueClient.receiveMessages({ numberOfMessages: 32, visibilityTimeout: 5 * 60 });
		if(receivedMsgsResp.receivedMessageItems.length){
			wait = 1;
			for (i = 0; i < receivedMsgsResp.receivedMessageItems.length; i++)
			{
				message = receivedMsgsResp.receivedMessageItems[i];
				const buff = Buffer.from(message.messageText, 'base64');
				const str = buff.toString('utf-8');
				console.log("Dequeuing message: ", str);
				await queueClient.deleteMessage(message.messageId, message.popReceipt);
			}		
		}else{
			wait = wait * 2
			if (wait > maxWait){
				wait = maxWait;			
			}		
		}
		console.log(`Wait ${wait} second(s).`)
		await delay(wait * 1000)
	}		
}

main()
