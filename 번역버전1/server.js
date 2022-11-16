var express = require('express');
var app = express();
var request = require('request');
var { OpenAIApi, Configuration } = require('openai');

let config = new Configuration({
  apiKey: 'openai사이트에있던 apikey',
});
let openai = new OpenAIApi(config);



app.get('/', function(req,res){
  res.sendFile(__dirname + '/index.html')
})

var client_id = '네이버api센터에서 발급받은 api id';
var client_secret = '네이버api센터에서 발급받은 api secret';

app.get('/translate', function (req, res) {
   var api_url = 'https://openapi.naver.com/v1/papago/n2mt';
   var query = req.query.q;
   
   var options = {
       url: api_url,
       form: {'source':'ko', 'target':'en', 'text':query},
       headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
    };
   request.post(options, function (error, response, body) {
       var 영어 = JSON.parse(body).message?.result.translatedText;

       openai.createCompletion({
          model: "text-davinci-002",
          prompt: 영어,
          temperature: 0.7,
          max_tokens: 128,
          top_p: 1,
          frequency_penalty: 0,
          presence_penalty: 0,
        }).then((result) => {
          console.log('ai 응답', result.data.choices[0].text);

          var api_url = 'https://openapi.naver.com/v1/papago/n2mt';
          var query = result.data.choices[0].text;
          var options = {
              url: api_url,
              form: {'source':'en', 'target':'ko', 'text':query},
              headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
          };
          request.post(options, function (error, response, body) {
            console.log(body);
            res.status(200).json(body);
              
          });


        }).catch((error)=>{
          console.log('openai error', error)
        })

   });
 });


 app.listen(3000, function () {
   console.log('http://localhost:3000/ app listening on port 3000!');
 });
