
const { Configuration, OpenAIApi } = require("openai");

const puppeteer = require('puppeteer');

require('dotenv').config();

let formattedMessage = [];

const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});

(async () =>
{
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    await page.goto(process.env.URL);
    await page.type('#email', process.env.USER_ID);
    await page.type('#pass', process.env.USER_KEY);

    let nav = page.waitForNavigation();

    page.click("#loginbutton");

    await nav;

    let result = '';

    result = await page.evaluate(() =>
    {
        return Array.from(document.querySelectorAll("div.x6prxxf.x1fc57z9.x1yc453h.x126k92a.xzsf02u")).map((el) => el.innerText);
    });

    let oldMessage = result[ result.length - 1 ];

    async function getText()
    {
        try
        {
            let date = new Date;

            let result2 = await page.evaluate(() =>
            {

                return Array.from(document.querySelectorAll("div.x6prxxf.x1fc57z9.x1yc453h.x126k92a.xzsf02u")).map((el) => el.innerText);

            });
            let newMessage = result2[ result2.length - 1 ];

            if(oldMessage != newMessage)
            {
                const selector = '.xzsf02u.x1a2a7pz.x1n2onr6.x14wi4xw.x1iyjqo2.x1gh3ibb.xisnujt.xeuugli.x1odjw0f.notranslate';

                let whosMessage = await page.evaluate(() =>
                {
                    let who = document.querySelectorAll('.x1rg5ohu.x5yr21d.xl1xv1r.xh8yej3');
                    return who[ who.length - 1 ].alt.split(" ");
                });

                formattedMessage.push({ role: "user", content: newMessage, name: whosMessage[ 0 ] });

                const openai = new OpenAIApi(configuration);

                console.log('AI is not currently typing');

                console.log(formattedMessage);

                console.log(date);

                console.log('A New Message Has Been Sent... Generating AI Response...' + '\n');
                oldMessage = newMessage;

                const completion = await openai.createChatCompletion({
                    model: "gpt-3.5-turbo",
                    temperature: 0.3,
                    max_tokens: 700,
                    messages: formattedMessage
                });
                console.log(completion.data);

                const AIresponse = completion.data.choices[ 0 ].message.content;

                formattedMessage.push({ role: "assistant", content: AIresponse, name: "Curie" });

                console.log("AI Response Was: " + AIresponse + '\n');

                if(completion.data.choices[ 0 ].message.content == "")
                {
                    page.type(selector, "It appears that the text you have provided is garbled and does not form coherent sentences. It is difficult for me to understand the intended meaning or topic of the text. Could you please provide a clear and concise question or statement for me to better assist you?").then(() =>
                    {
                        page.keyboard.press('Enter');
                    });
                }

                await page.type(selector, AIresponse, { delay: 10 }).then(() =>
                {
                    page.keyboard.press('Enter');
                });

            } else if(newMessage == oldMessage)
            {
                console.log(date);
                console.log('The Message Has Not Changed... Waiting for New Message...' + '\n');
            }
        } catch(error)
        {
            if(error.response)
            {
                console.log("error1", error.response.status);

                console.log('error2', error.response.data);
                const half = Math.ceil(formattedMessage.length / 8);
                let secondHalf = formattedMessage.slice(half);
                formattedMessage = secondHalf;

            } else
            {
                console.log('error3', error.message);
                const half = Math.ceil(formattedMessage.length / 8);
                let secondHalf = formattedMessage.slice(half);
                formattedMessage = secondHalf;

            }
        }
    }

    let checkIfAIisTyping = await page.evaluate(() =>
    {
        let textInput = document.querySelectorAll('.xat24cr.xdj266r.xdpxx8g');
        return textInput[ 0 ]?.innerText;
    });
    console.log("checkIfAIisTyping", checkIfAIisTyping);

    if(checkIfAIisTyping == '')
    {
        console.log('AI is currently typing');
        newMessage = oldMessage;
    } else
    {
        setInterval(getText, 25000);
    }
})();


