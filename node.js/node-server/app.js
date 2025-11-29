import http from "http";

var server = http.createServer((request, response)=>{

})

server.listen(8080);

console.log('node.js server at port 8080')



/* 
🚀 1. http.createServer Ne İş Yapar?
import http from "http";

const server = http.createServer((req, res) => {

});


Bu satır:

Node.js’e “HTTP protokolünde bir sunucu oluştur” der.

İçeride C++ tarafındaki http_parser ve libuv ile socket listener hazırlanır.

Senin verdiğin callback ((req, res) => {}) her gelen HTTP isteğinde çalışacak fonksiyon olarak kaydedilir.



🚀 2. server.listen(8080) Ne Yapar?

server.listen(8080);
Bu satır:

8080 portunda bir TCP server socket açar

Bu işi libuv yapar (C katmanında)

Node.js event loop’a şunu söyler:

"8080 portuna bir bağlantı geldiğinde haber ver, ben callback'i çalıştıracağım."

Yani Node.js bekleyen bir server olur.



🚀 3. İstek (Request) Geldiğinde Ne Olur?

Birisi tarayıcıdan şu URL’i açtığında:

http://localhost:8080/


Arka planda şöyle bir akış olur:

🧠 AŞAMA 1 — Libuv TCP bağlantısını yakalar

libuv çekirdeğe der ki:

“8080 portunda bağlantı bekliyorum.”

Bir bağlantı geldiğinde libuv:

✔ Socket üzerinden gelen ham veriyi alır
✔ HTTP parser’a gönderir
✔ Parser bunu request objesi haline getirir
✔ Response için de bir response objesi oluşturur

Bunlar artık JavaScript tarafına aktarılacak nesnelerdir.

🧠 AŞAMA 2 — Callback Event Loop Kuyruğuna Eklenir

Gelen isteği işlemek için Node.js şunu yapar:

✔ Senin verdiğin callback fonksiyonuna req ve res objelerini parametre olarak doldurur
✔ “incoming request event” oluşur
✔ Bu event, event loop’un callback queue’suna eklenir

Yani callback’i hazırlayıp kuyruğa bırakır.

🧠 AŞAMA 3 — Event Loop Uygun Anda Callback’i V8’e Gönderir

Event loop çalışır:

Boşta mıyım?  
Timer var mı?  
I/O var mı?  
Callback kuyruğunda ne var?


Callback kuyruğunda request handler varsa:

👉 O callback’i V8’in çalıştırma stack’ine gönderir.

Artık JavaScript devreye girer.

🧠 AŞAMA 4 — Callback JavaScript Tarafında Çalışır

Yani şuradaki fonksiyon:

(request, response) => {

}


JavaScript tarafında V8 üzerinde çalışır.

Sen response.end() yazarsan:

Node.js HTTP header’larını düzenler

libuv üzerinden sokete yazar

C tarafı üzerinden tarayıcıya gönderilir

💡 KISA VERSION (Süper Net Özet)**

Bir istek geldiğinde tam olarak şu olur:

libuv → Portu dinler

libuv → Veriyi alır, http_parser’a verir

Node.js → req/res objelerini oluşturur

Event Loop → Callback kuyruğuna ekler

Event Loop → Callback’i V8’e gönderir

V8 → Senin yazdığın callback çalışır

Node.js → response’u network’e geri gönderir

🔥 Senin Yazdığın Mantık Doğru Mu?

Evet, aynen şöyle dedin:

“libuv request’i aldı, request ve response objelerini oluşturdu, callback kuyruğuna koydu, event loop bunu V8’e gönderdi, callback çalıştı”

Bu tamamen doğru ve harika bir açıklama.

🧠 Sana çok temiz bir metafor da vereyim (en iyi anlatım):
🏢 Node.js bir şirket olsun:
libuv → güvenlik + kargo birimi

Kapıya biri gelince haber verir

Gelen paketi açar (HTTP parser)

İçeri yollar

Event Loop → sekreter

Gelen işleri sıraya alır

Uygun olduğunda içeri gönderir

V8 → ofisteki çalışan JS motoru

Sana teslim edilen işi yapar

Çıktıyı tekrar libuv’a verir

Senin callback → çalışan tarafından yapılacak iş planı


BAŞLIK BAŞLIK BAŞLIK

request, response ile neler yapılabilinir

🚀 1. request (req) ile Yapabileceklerin

Request, tarayıcıdan (veya API’dan, Postman’dan) gelen tüm bilgileri barındırır.

✔️ 1.1. URL’i alma
req.url

Örnek:

/products?id=10

✔️ 1.2. HTTP metodunu alma
req.method

Örnek:

GET
POST
PUT
DELETE

✔️ 1.3. Header bilgilerine erişim
req.headers

Örnek:

req.headers['user-agent']
req.headers['content-type']

✔️ 1.4. Query string'i parçalama

Node.js kendisi query’i ayırmaz. Kendin yaparsın:

import { URL } from "url";

const parsed = new URL(req.url, "http://localhost");
console.log(parsed.searchParams.get("id"));

✔️ 1.5. Body verisini okuma (POST - önemli)

Body asenkron gelir. Böyle okursun:

let body = "";

req.on("data", chunk => {
  body += chunk;
});

req.on("end", () => {
  console.log("Gelen veri:", body);
});

✔️ 1.6. Cookie okuma
const cookies = req.headers.cookie;

✔️ 1.7. IP adresi alma
req.socket.remoteAddress


Bu bilgiyi siparişlerde kullanacaksın ✔️

🔥 Kısacası request ile:

URL okursun
Header okursun
Body okursun
Cookie okursun
IP okursun
Method okursun
Query parametrelerini ayıklarsın
JSON parse edersin


Sergen, çok doğru bir soru.
“req ile sadece gelen veriyi mi okuyorum, başka hiçbir şey yapamaz mıyım?” diye soruyorsun.

Cevap:
👉 Evet yapabilirsin — ama sınırlıdır.
Çünkü request nesnesi “sadece gelen isteğin bilgilerini taşır”.

Ama bunun içinde aslında tahmin ettiğinden daha fazla güç var.

Aşağıda tüm yapılabilecekleri en detaylı liste olarak veriyorum:


🧠 Request (req) ile Yapılabileceklerin TAM LİSTESİ
🟢 1. Gelen HTTP bilgisini okumak

Bu zaten biliyorsun:

URL

Query

Params

Method

Headers

Cookies

Body

IP

Protocol (http/https)

HTTP versiyon

Hostname

Pathname

Port

🟢 2. Streaming Data Okuyabilirsin (Video, JSON, Image, Büyük Body)

Request bir stream'dir.

Yani:

req.on("data", chunk => {})
req.on("end", () => {})


Bu sayede her türlü veri akışını okuyabilirsin:

büyük JSON verileri

dosya upload

dosya okuma

video upload

chunked data

form-data

multipart

Örnek: 1GB dosya upload eden kullanıcıyı bile yönetebilirsin.

🟢 3. Request’i “abort” edebilirsin

Bağlantıyı kesebilirsin:

req.destroy();


Bu ne işe yarar?

DDOS engelleme

Çok büyük request’i reddetme

Şüpheli request’i kapatma

🟢 4. Timeout belirleyebilirsin

İstek çok uzun sürerse otomatik kesebilirsin:

req.setTimeout(5000, () => {
  req.destroy();
});


Bu kritik bir güvenlik özelliğidir.

🟢 5. Client disconnect olayını yakalayabilirsin

Kullanıcı sayfayı kapattığında algılarsın:

req.on("close", () => {
    console.log("İstemci bağlantıyı kapattı");
});


Gerçek sipariş sistemlerinde faydalı.

🟢 6. Request Proxy veya Load Balancer arkasından geliyorsa bilgi çekebilirsin

Reverse proxy kullanıyorsan (NGINX, Cloudflare, Vercel, Render):

req.headers['x-forwarded-for'];
req.headers['x-real-ip'];


Gerçek kullanıcı IP’sini bulmak için.

🟢 7. Keep-Alive bağlantılarını yönetebilirsin

Tarayıcı ile Node.js arasında bağlantı açık kalabilir.

req.headers['connection'];


keep-alive mı?

close mı?

Bu performans için önemlidir.

🟢 8. HTTP Upgrade işlemlerini yönetebilirsin (WebSocket)

Request üzerinden WebSocket bağlantısını başlatabilirsin.

Örnek:

server.on("upgrade", (req, socket, head) => {
    // WebSocket upgrade burada yapılır
});


Yani req → WebSocket’e geçiş için kullanılır.

Bu çok büyük bir güç.

🟢 9. Basic Auth login bilgisi çözebilirsin

Tarayıcıdan gelen auth header’ını çözer:

const auth = req.headers.authorization;


Base64 çözersin ve kullanıcı adı/parola gelir.

🟢 10. Gelen “Content-Type”'a göre body işleme

Örneğin:

application/json

multipart/form-data

application/x-www-form-urlencoded

text/plain

binary/octet-stream

image/jpeg

audio/mpeg

Hepsini request üstünden analiz edersin.

🟢 11. Request’i başka bir server’a forward edebilirsin (Proxy Server gibi)

Kullanıcıdan gelen isteği başka sunucuya yönlendirebilirsin.

Bu tam bir reverse proxy mantığıdır:

req.pipe(otherServerRequest);

🟢 12. Request ile multi-part form verisini kontrol edebilirsin

Yani dosya yükleme:

fotoğraf yükleme

video yükleme

PDF gönderme

Bunları request’in stream yapısı sayesinde okuyabilirsin.

🧠 Sonuç:

Request sadece “bilgi alma” değildir.

Aşağıdaki gelişmiş şeyleri de yaparsın:

Streaming işlemleri

Upload yönetimi

Timeout kontrolü

Bağlantı kapatma

Client disconnect algılama

Reverse proxy çalışma

WebSocket upgrade etme

Basic Auth çözme

Load balancer header’larını kullanma

Büyük dosya yönetimi

Veri akışı yönlendirme (pipe)
*/

