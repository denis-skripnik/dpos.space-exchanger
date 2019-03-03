# viz-exchange
**Обменник для VIZ, STEEM, GOLOS и Whaleshares. Поддерживаются все направления. Opensource.**

## Функционал:
1. Поддержка четырёх блокчейнов с возможностью увеличения их количества;
2. Все настройки находятся в config.json - лезть в javascript код не придётся;
3. Направления: viz/golos, golos/viz, viz/steem, steem/viz, viz/whaleshares, whaleshares/viz, golos/steem, steem/golos, golos/whaleshares, whaleshares/golos, steem/whaleshares, whaleshares/steem. Если какие-то из блокчейнов имеют статус активности false, направления с ними недоступны.
4. Курс выставляется в json файле в каждом блокчейне к viz. Например, в Golos стоит 0.5, т.к. 1 golos = 0.5 viz, но вы можете это изменить;
5. Курс обмена двух блокчейнов, не связанных с viz, основывается на цене к viz каждого из этих двух токенов.
6. Поддерживаются только токены golos, steem, wls, viz (sbd и gbg не поддерживаются);
7. Стабильность: в случае выключения скрипта, его перезагрузки все необработанные блоки сохранятся, также как и непроверенные переводы;
8. Проверка всех действий: если перевод не дошёл, например, из-за отклонённого блока, он будет проведён ещё раз;
9. Проведены тесты на перевод с указанием неверных memo, с превышением максимума, с нормальной отправкой, с несуществующим аккаунтом в блокчейне-получателе, а также отправлено 500 переводов одной транзакцией - всё успешно.
10. Возможность заработка: укажите комиссию и пользователю будет переводиться сумма за минусом этой комиссии.
11. viz-exchange с открытым кодом и полностью бесплатен.
12. В описании аккаунта (metadata.profile.about) показываются максимумы обмена токена данного блокчейна на токены других, а также курс токена к другим. Например, на Голосе отображается, что вы можете обменять 1 vigolos на viz, 2 golos на steem, 5 golos на whaleshares, а также что курс к viz 0,5, к steem 0.33 (рассчитывается на основе курса golos/viz и steem/viz). При этом, максимумы указываются с учётом этих курсов, т.е. если у вас показано, что вы можете обменять максимум 1 golos на viz и курс 0.5, значит там у вас 0.5 viz.
При этом, если балансы в других блокчейнах не менялись, отправляться обновление информации не будет. То есть, если в блокчейнах viz, steem балансы не меняются и вы не меняли курс/комиссию, на Голосе описание не изменится.
13. Вы можете изменить статус блокчейна на false: тогда направления с ним будут недоступны и информация добавляться не будет.

## Правила обмена:
1. Пользователь узнаёт аккаунт шлюза,
2. Производит перевод любой суммы (ниже максимума) туда с указанием memo в следующем формате: blockchain:login.
Пример: viz:denis-skripnik. Это значит, что я обмениваю токены другого блокчейна на viz.
**Обращаю внимание, что viz - не токен, а блокчейн. т.е. если пользователь отправит wls:login, ему средства вернутся, поскольку надо писать whaleshares.**
3. Если будет какая-то ошибка, придёт ответный перевод с той-же суммой и текстом с ошибкой на понятном языке;
Если же всё ок, придёт сумма в другом токене с memo, сообщающем об успехе, а также содержащем логин шлюза, курс и комиссию.


## работа с config.json:
Здесь сейчас 4 раздела: viz, golos, steem, whaleshares (по названию блокчейнов). В каждом из них первой строчкой идёт active: если установите true (без кавычек), блокчейн будет активен, false - неактивен.
Далее прописывается название токена (у viz это "token": "VIZ").
На следующей строке указывается название библиотеки (у viz это viz-js-lib);
Далее указывается адрес паблик-Ноды: параметр node;
Следующие 3 строки - это логин, постинг ключ (для обновления информации об аккаунте) и активный ключ (для переводов). Указывать обязательно все. Параметры называются так: "login", "posting_key", "active_key". В значениях необходимо будет заменить user (логин), 5j (постинг ключ), 5k (активный ключ);
how_to_viz указывает, сколько viz сможет получить пользователь при переводе 1 токена. Например, у viz это 1, у golos - 0.5 (значения по умолчанию для примера: их вы можете изменить).
fee - это процент комиссии (по умолчанию 0). **Знак процента указывать нельзя**.

Также во всех секциях config.json.

## Установка:
1. в папке, где хотите видеть viz-exchange выполняете:
git clone https://github.com/denis-skripnik/viz-exchange
2. Переходите в папку шлюза:
cd viz-exchange
3. Правите конфиг файл (СМ. информацию выше).
4. Запускаете: node exchange или pm2 start exchange.js.

Для работы в фоновом режиме (чтоб вы могли закрыть окно консоли) необходимо использовать pm2. Устанавливается он командой:
sudo npm install pm2 -g

***

## Концепция множества частных шлюзов:
Каждый пользователь имеет своё мнение по поводу того, какова стоимость того или иного токена.
Можно, конечно, разместить заявку на биржах, но обычно пользователи блокчейнов находятся на разных биржах: на одной одни, на второй другие...
Создав же такой шлюз при помощи viz-exchange вы повысите шансы найти покупателя/продавца токена в соответствии с вашим видением цены.

## Технические детали.
### Используемые технологии:
1. node.js;
2. Файловая база данных nedb;
3. viz-js-lib, golos-js, steem, wlsjs - библиотеки блокчейнов;
4. Код модульный.

### Структура папок и файлов:
1. В корне находится основной файл exchange.js, в котором подключается модуль обновления информации об аккаунте update_accounts, модуль получения блоков blocks-generator, helpers - модуль с методами-помощниками, например, sleep (приостанавливает выполнение на определённое время).
Также там подключается methods - модуль с методами api и broadcast блокчейнов, trxdb - модуль, работающий с базой данных транзакций, conf - подключение config.json.
Кроме того, на базе содержимого конфиг-файла составляется массив со списком блокчейнов; прописана функция вызова метода, получающего блоки, в цикле блокчейнов, чтобы можно было работать с блоками всех добавленных блокчейнов;
Функция workingTrx работает с добавленными в базу данных транзакциями, проверяет их наличие через 1,5 минуты. Она вызывается в setInterval каждые 1,5 минуты.
Ниже вызывается метод обновления аккаунтов из модуля update_accounts каждые 3 секунды.
2. package.json и package-lock.json - 2 файла, в которых прописаны используемые npm модули.
3. 500_ops_test.js - файл, в котором тестируется отправка 500 переводов в одной транзакции.
Для его работоспособности необходимо изменить login и wif с name и 5k на свои значения соответственно. wif - активный ключ.
4. В папке databases находятся после запуска шлюза 5 баз данных: golos_block.db, steem_block.db, viz_block.db, whaleshares_block.db и trxs.db. Первые 4 содержат последний/ие блоки соответствующих блокчейнов, а последний - транзакции с переводом, которые необходимо проверить.
Структура баз данных блоков - это объекты, содержащие last_block со значением в виде номера блока и _id - уникальный идентификатор объекта в базе, а база с транзакциями содержит номер транзакции, от кого, кому, сумму с токеном ("1.000 golos") и memo.
5. Папка js_modules:
5.1. blocksdb.js - это файл, работающий с базой данных блоков. Там прописаны методы для получения последнего блока (аргументами являются название блокчейна и номер последнего необратимого блока - если ответ будет пустым, вернёт его), который называется getBlock, а также метод обновления объекта, содержащего последний блок (updateBlock);
5.2. Файл blocks-generator.js - сама генерация блоков.
Тут подключается модуль x2y, где производится просмотр операций блока, а также работа с ними, если они являются переводами и в memo нет определённых текстов, которые прописаны в условии; helpers - всякие помощники, например, приостановка работы скрипта; methods - методы блокчейнов, bdb - файл работы с базой данных блоков.
Также прописаны константы LONG_DELAY и SHORT_DELAY, которые содержат значения 12000 и 3000. Они нужны, чтобы дольше делать паузу в случае ошибок.
Ниже находится функция generate с именем блокчейна в аргументах. Там происходит получение последнего необратимого блока, получение блока из базы chain_blocks.db (где chain - имя блокчейна), а также запускает цикл прохождения по блокам. Если в базе нет блока, от последнего необратимого, а если есть - от него.
В цикле проверяется, что если блок > необратимого, приостановить на delay секунд (зависит от того, была ошибка в прошлый раз или нет) и вызвать получение параметров блокчейна ещё раз. Когда bn < необратимого, происходит проверка: если 0 < количества успешных операций, delay = 3000 мс, а иначе - delay = 12000. Также в этом случае происходит увеличение номера блока на 1 и обновление в базе данных.
А да: весь код цикла обёрнут в try/catch. Если catch (ошибка), выводится она и происходит приостановка на 1 секунду.
5.3. helpers.js - модуль с методами-помощниками: unixTime (получение текущего времени в unixtime формате), sleep (приостановка), nowDateTime (Получение текущей даты и времени в понятном строковом формате).
5.4. methods.js: вызывается config файл и происходит добавление либ блокчейнов по циклу,. а также получается из конфига и устанавливается адрес паблик-Ноды.
getOpsInBlock - получает операции в блоке, требует указания названия блокчейна и номера блока.
getAccount - для getAccounts. Принимает имя БЧ, логин. Причём не несколько, а только 1.
getProps - getDynamicGlobalProperties. Требуется указать только название БЧ.
accountUpdate - обновление инфы. Принимает БЧ, активный ключ, логин, memo ключ публичный и строку с сообщением информации об аккаунте.
transfer - перевод с использованием подписи транзакции и отправки при помощи api.broadcastTransactionSyncrenise. Требуется указать блокчейн, активный ключ, логин (от кого), кому, сумму и memo.
getBlockHeader - используется для получения даты последнего необратимого блока без данных блока. Принимает название БЧ, block_num.
getTransaction - получение транзакции: блокчейн, id транзакции.
5.5. transactionsdb.js - файл работы с базой транзакций. Тут есть методы добавления транзакции, удаления, обновления и получения транзы старше определённого времени. По поводу последнего: берётся текущее время, вычитается 90 секунд, указывается в методе получения списка транзакций старше этого времени.
5.6. update_accounts.js - Модуль обновления информации в аккаунтах. Тут подключаются модули helpers для вывода текущей даты и времени в нормальном виде, а также methods и конфиг файл.
Единственный метод тут - это updateAccounts.
Перед ним формируется массив msg_strings, который содержит старые варианты строк (необходимо для сравнения с новым).
Далее по циклу проходит блокчейны, а в каждом из них - по циклу других блокчейнов. В первом проверяется активный статус БЧ, указывается токен, а также начала строк вывода инфы о максимумах и курсах.
Во втором проверяется активность блокчейна, а также то, что он не равен блокчейну из первого цикла.
Далее получается курс токена блокчейна из первого цикла к токену бч из второго, название токена текущего блокчейна, получается информация об аккаунте шлюза блокчейна из второго цикла и записывается в переменную баланс этого аккаунта. Также записывается в специальную переменную комиссия, рассчитывается, сколько токенов будет комиссией, и вычитается из баланса аккаунта эта сумма комиссии. После этого итоговая сумма приводится к 3 знакам после запятой.
Также во втором цикле указывается строка для максимумов с конкретными данными по текущему блокчейну, а также строка с курсом токена первого цикла к токену второго. Обе заканчиваются запятой (Последняя убирается после дочернего цикла).
На этом цикл второй заканчивается, а также происходит проверка на совпадения старой строки с новой. Если они отличаются, происходит формирование новой строки и её отправка в блокчейн.

В конце происходит очистка msg_strings с последующим добавлением текущих значений. Всё.
5.7. x2y.js - модуль, в котором происходит обработка блока:
Просмотр операций (функция processBlock). В ней происходит проход по циклу операций и, если это перевод, получатель равен аккаунту шлюза и memo не содержит запрещённых строк (например, "return:", "Токен не поддерживвается" и т.п.). Также перед циклом операций устанавливается счётчик ok_ops_count со значением 0. Он указывает на количество успешных операций и прописывается в return.
Если всё ок, вызывается метод processTransfer, аргументами которого являются название блокчейна и содержимое перевода. Он возвращает 1, если операция успешна и 0, если нет. Это позволило её вызвать в значении счётчика ok_ops_count (ok_ops_count += processTransfer(x, opbody)).
В самом методе происходит работа с операцией: получение названия токена блокчейна-отправителя, назначение memo переменной и перевод memo в нижний регистр, после чего- создание массива, содержащего то, что до двоеточие и то, что после него. Далее проверяется, совпадает ли первая часть с одним из блокчейнов в массиве chains, который формируется на базе конфига. Если да, производится дальнейшая работа над переводом, если нет - возвращается сумма с текстом о том, что блокчейн не существует.
При наличии БЧ в списке происходит указание его в переменной y, а также получение из конфиг файла имени токена этого блокчейна и установка значением переменной to логина получателя средств (Вторая часть memo).
Далее производится расчёт курса токена БЧ-отправителя к ББЧ-получателю и получение комиссии, происходит расчёт суммы с учётом всего этого.
После создания переменной let receive_approve, которая указывает на статус, происходит получение данных аккаунта, куда планируется отправить токены. Если массив с данными аккаунта не пуст и нет ошибки, устанавливается статус "ok", если он пуст - receive_approve равен "noAccount", если ошибка (catch) - "noConnection".
Ниже происходит получение данных аккаунта шлюза, который будет отправлять токены и проверяется баланс: если он меньше суммы, которую должен получить пользователь, receive_approve = "noBalance", если catch - "noConnection".

Далее проверяется, что блокчейн отправителя - это golos или steem. Если так, происходит проверка токена: sbd/gbg - возврат средств с указанием сообщения о том, что токен не поддерживается (статус 'noSupportedToken').
Далее происходит проверка в условии статуса. Если ok, прибавляется к сумме перевода имя токена блокчейна-получателя, указывается memo об успешном переводе с указанием аккаунта шлюза, курса и комиссии.
Если статус "noBalance", "noSupportedToken", "noConnection" или undefined, "noAccount", происходит возврат средств с соответствующими им memo.
Также в каждом условии статуса происходит возврат числа успешных переводов (1 или 0). Это реализовано при помощи указания return перед методом sendTransfer.
Сам метод принимает блокчейн, активный ключ, логины отправителя, получателя, сумму и заметку (memo). Он находится выше и выполняет перевод, после чего проверяет, что возвратил метод трансфера. Если это не 0, получает текущее время в unixtime и добавляет в базу транзакций и возвращает 1. Если 0 - возвращает 0.
Кстати, в консоль выводится статус того или иного перевода (ok, nobalance и т.п.), а также количество успешных операций.

## Как добавить новый блокчейн:
Эта инструкция предназначена разработчикам, т.к. вряд ли простые пользователи viz-exchange справятся с этим.
1. Идёте в файл js_modules/methods.js и смотрите список используемых модулей. Изучаете документацию к либе нужного вам блокчейна и определяете, есть ли там такие методы. Смотрите, чтоб запрашиваемые данные и их формат совпадал с тем, что в файле.
2. Если всё ок, идёте в config.json и создаёте новую секцию настроек. Можете просто скопировать 1 из блокчейнов, например, golos,, начиная с самого параметра и заканчивая "},". Проверьте, чтоб ваша ide не выдовала ошибок.
3. Переименовываете golos в ваш блокчейн, если копировали. Далее меняете значение параметра lib на другое.
4. Также прописываете другую паблик-Ноду в параметре node.
5. Пишете данные: логин, ключи.
6. Задаёте курс токена к VIZ и комиссию (если нужна).
7. Проверяете, запустив node exchange 2> errors.log, что всё ок.
8. Буду рад пулл-реквестам.

***

## **Внимание**
1. Автор viz-exchange не несёт ответственность за обман пользователь теми, кто говорит о создании шлюза;
2. Автор не несёт ответственнности за неработоспособность шлюза из-за нехватки ресурсов на сервере его создателя, из-за неуплаты сервера или других причин;
3. Автор viz-exchange не несёт ответственности за возможные атаки на шлюзы.

## Контакты:
По вопросам, связанным со скриптом обращаться по контактам:
1. Telegram: https://t.me/skripnikdenis
2. Vk: https://vk.com/denis_skripnik;
3. E-mail: scadens@yandex.ru