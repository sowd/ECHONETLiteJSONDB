[HEMS認証支援センターのECHONET Lite DB](https://smarthouse-center.org/sdk/download/form/29)を独断的に変更したもの。[変換プログラムはここ](https://github.com/sowd/ECHONETLiteJSONDB_Converter)にあるが、本リポジトリはプログラムで出力した後に手作業で改善することを目的にしている。

<hr />

変更点概要：

1. 元ファイルでは仕様の情報と言語情報（epcNameなど）が混在していたため、仕様情報ファイルとリソースファイルを分けた。
2. リソースは主に日本語で提供されているので、これをGoogle Cloud Translation APIを用いて英語に自動変換し、日英リソースを用意。
3. SonyCSLで独自にECHONET Lite仕様書から抽出したEPCの説明文情報を追加している。あまりきれいなものではないのと、Release Cのドキュメントから持ってきたものであるという問題がある。元ドキュメントにあっても、DBには入っていない場合もある(ノードプロファイルなど)。また、元ドキュメントには日本語版もあるが、今回は英語版のドキュメントをGoogle Cloud Translation APIで日本語に翻訳しているので、おかしなところが多々発生している。
4. content情報は対処が困難だったため、そのまま出力している。このために、contentの中のみリソース情報が混入している。日・英も混在している。
5. 元リポジトリではnodeProfileとsuperClass、deviceObjectの３つのファイルで情報が記述されているが、まとめたall*.jsonというファイルも用意した

また、本来keyはUniqueなものであるべきなので、ObjectのIDやEPCは16進数の文字列よりも10進の数値にしたほうがよいのではと一瞬思ったが、自分含め16進で記憶しているECHONET Lite Geeksも多いため、オリジナル通り'0x****'といった文字列をkeyにしている。

＊_Body.json の中の文字列リソースは$から始まるキー文字列になっている($EPCNAME_OPERATING_STATEなど)。対応する各言語の文字列がリソースファイル(＊_EN.jsonや＊_JP.json)にある。文字列リソースを自動で埋め込んだ単一のファイルを作るには、以下のコマンドを用いる。

```bash
node replacer.js [json file to be output] [resource file]
```

とする。例えば、以下のようにすると、all_Body.jsonにリソースとして日本語が埋め込まれたファイルが出力される。

```bash
node replacer.js all_Body.json all_JP.json
```

結果は標準出力に表示されるので、適宜リダイレクトでファイル化する。

以下、[HEMS認証支援センター版](https://smarthouse-center.org/sdk/download/form/29)にあったオリジナルのReadme.mdより。これを読むとcontentの中身が理解できる。
<hr />

Readme ECHONET機器オブジェクトのJSON file

2016.09.12

#1. 概要

　ECHONET Liteプロトコルの各機器毎の機能や設定値の詳細は「ECHONET機器オブジェクト詳細規定」としてエコーネットコンソーシアムからPDF形式で公開されている。ECHONET Liteプロトコルを利用してコントローラやサービスを開発する際にはそこに記述されているデータを利用する必要があるが、現状はプログラムから容易に利用できないため、「ECHONET機器オブジェクト詳細規定」を目で見てデータを手入力するという非効率な作業を強いられている。
　そこでECHONET Liteを利用したコントローラやサービスアプリケーションの開発を促進するために、「ECHONET機器オブジェクト詳細規定」をプログラムで利用しやすいデータにして公開することにした。

#2. SCOPE
　コントローラやサービスアプリケーションがECHONET Liteプロトコルのデータをパースして表示する際に利用したり、機器制御のためにECHONET Liteプロトコルのパケットを作成するときに利用することを想定し、アクセスルールやプロパティ内容（データのタイプ、意味、値域や単位など）をJSON形式のファイルとして提供する。全く同じ形式で記述された以下の３つのファイルで構成される。

- 機器オブジェクト用JSON file (deviceObject.json)
- ノードプロファイル用JSON file (nodeProfile.json)
- スーパークラス用JSON file (superClass.json)

　ノードプロファイル用JSON fileは、ノードプロファイルのスーパークラス部分と機器オブジェクト部分の両方を記述したものである。スーパークラス用JSON fileは機器オブジェクトのスーパークラスを記述したものである。機器オブジェクト用JSON fileは各機器オブジェクトのうちスーパークラスをのぞいた部分を記述したものである。
　これらのJSON fileの詳細は後述する。
　
　JSON fileは __JsonMaker.xlsx__ というEXCEL fileを利用して作成している。JSON fileを修正する場合は __JsonMaker.xlsx__ を修正し、JSON fileを作成する。 __JsonMaker.xlsx__ に関しては __Readme_JasonMaker__ を参照のこと。
　
　JsonMaker を作成する際に、まず既存の pdf の内容をできるだけストレートに Excel file（Appendix-G.xlsx）化した。PDFを見るよりも容易にデータにアクセスできることがあるので、この Excel file も公開する。

#3. 課題と方針

　「ECHONET機器オブジェクト詳細規定」をデータ化するにあたり、以下の３つの課題がある。
　
　1. アクセスルールをどのように記述するか
　2. プロパティの構造をどのように記述するか
　3. プロパティ内容をどのように整理し記述するか

以下に概要を説明する。詳細は後述。
（NOTE: <strong>オブジェクト</strong>という単語はこの後さまざまな文脈の中で使われる。混乱を避けるためにJSONのデータ型の一つであるオブジェクトを示す場合はobjectと表記する。

###アクセスルール
　アクセスルールに関しては、<strong>アクセスルール</strong>・<strong>必須</strong>・<strong>状変時アナウンス</strong>・<strong>備考</strong> の各コラムのデータが関連している。アクセスルールにはSet, Get, Set/Getのいずれかの値が記述されている。必須と状変時アナウンスは空欄または○が記述されている。備考欄には条件が記述されている。このままではSet, Get, 状変アナウンスそれぞれに対しての情報が整理されておらず利用しにくいので、Set, Get, 状変アナウンス毎に必須（required）, 必須ではない（optional）, 適応外（notApplicable）のどれかで表現する。備考欄の情報は Conditionとしてstringで表現する。

###プロパティの構造
　「ECHONET機器オブジェクト詳細規定」の各機器オブジェクトの<strong>データ型</strong>のコラムを見ると複数データが記述されている場合がある。例えば<strong>低圧スマート電力量メータ</strong>(0x0288)のEPC=0xE2のデータ型は <strong>unsigned short + unsigned long x 48</strong> と記述されている。プロパティ内容の欄を参照すると、
> 1〜2バイト：積算履歴収集日 0〜99
> 3バイト目以降；積算電力量計測値　0〜99,999,999 kWh

と記述されている。このように一つのプロパティの中に意味やタイプが異なるデータが複数存在し、また特定のデータが繰り返される場合もある。そこで意味を持つ最小のデータの単位として __ELEMENT__ という概念を導入する。プロパティは複数のELEMENTから構成され、各ELEMENTは名前, サイズ, 繰り返し回数, コンテンツで構成される。上記の例は、このように記述できる。
> 名前 = 積算履歴収集日, サイズ = 2(byte), 繰り返し回数 = 1, コンテンツ = unsigned integer, 0~99 day
> 名前 = 積算電力量計測値, サイズ = 4(byte), 繰り返し回数 = 48, コンテンツ = unsigned integer, 0~99999999 kWh

名前以外の項目が同じであるELEMENTが連続する場合は、名前を "/" を使って列挙し、繰り返しとして表現する。
（例）家庭用エアコン(0x0130) EPC=0xB8:定格消費電力値
> 名前 = 冷房/暖房/除湿/送風, サイズ = 2(byte), 繰り返し回数 = 4, コンテンツ = unsigned integer, 0~65,533 W


###プロパティの内容
　プロパティの内容を以下のように整理した。

- keyValues: 個々の数値にそれぞれ意味を持たせた場合。例: 0x30=ON
- numericValue: 数値の場合。例: 25%
- level: 制御のレベルをある範囲の値に対応させた場合。例: 0x31->レベル1, ... 0x38->レベル8
- bitmap: bit毎に動作設定を定義した場合。
- rawData: 数値としてではなく、値そのものを利用する場合。例: 製造番号
- customType: 複数のnumericValueの組み合わせで特定の意味を持つ場合。例: 年月日, 日時
- others: その他の場合。例: 特定のEPC固有のdecode方法を持つ場合。

以下にそれぞれをどのように記述するかを説明する。

__keyValues__
JSONのobject形式でKeyとValueを列挙する。keyは数値をHEX表示したstringである。ただしある範囲の数値を示すために二つの数値を"..."で接続した表記も利用する。
（例）"0x30":"ON", "0x45...0xFF":"ユーザー定義"

__numericValue__
数値は以下の項目で記述する。
"integerType":	符号なし"Unsigned"か、符号付き"Signed"を示す
"magnification":	倍率を10のN乗表記した指数部。省略可。例: -1(x0.1), 2(x100)
"unit":	単位。省略可。例: "℃"
"min":値域の最小値, 例: 0
"max":値域の最大値, 例: 100
（例）"integerType":"Unsigned", "magnification":-1, "unit":"A", "min":0, "max":1000
値域が0Aから100.0Aの値。符号なしで0.1倍する。

__level__
最小値(min)と最大値(max)で記述する。
（例）"min":0, "max":8

__bitmap__
bitmapは以下の項目で記述する。
"bitName":名前。 例: "電気集塵方式"
"bitRange":	対応するbitの番号。複数bitを指定する場合は列挙する。例: [0], [0,1,2]
"bitValues":	bit(s)の値とValueをobject形式で記述する。例: {"0":"ON", "1":"OFF"}

__rawData__
raw dataとしては、"binary", "ASCII", "ShiftJIS"を定義している。
（例）"rawData":"binary"

__customType__
custom typeとして以下のものを定義している。
YYM: Year(2byte), Month(1byte)
YYMD: Year(2byte), Month(1byte), Day(1byte)
HM:	Hour(1byte), Minute(1byte)
HMS:	Hour(1byte), Minute(1byte), Second(1byte)
HMF:	Hour(1byte), Minute(1byte), Frame(1byte)
MS:	Minute(1byte), Second(1byte)

__others__
othersとして以下のものを定義している。
"referSpec": 仕様書参照
"reserved": 予約済


#4. JSONファイルの例
　まずは簡単な例を通して、構造や内容の様子をみてみよう。以下のJSONデータは、<strong>家庭用エアコン</strong>と<strong>一般照明</strong>の機器オブジェクトの抜粋である。プロパティとしてはそれぞれ<strong>動作状態</strong>と<strong>運転モード設定</strong>、<strong>動作状態</strong>と<strong>照度レベル設定</strong>を記述している。
　エアコンを記述しているobjectの名前は、ECHONET Lite Object Codeで家庭用エアコンを示す"0x0130"であり、値は機器オブジェクト名を表すobject(objectName)とプロパティを表すobject(epcs)で構成される。動作状態のプロパティは"0x30"と"0x31"の値を取り、それぞれ"ON", "OFF"の意味を持つ。
　一般照明の照度レベル設定のプロパティはSet、Getとも必須ではなく、0~100%の値を持つことがわかる。


```jason
{  
    "version":"G",
    "date":"2016/8/23",
    "elObjects":{
        "0x0130":{  
            "objectName":"家庭用エアコン",
            "epcs":{  
                "0x80":{  
                    "epcName":"動作状態",
                    "epcSize":1,
                    "accessModeSet":"required",
                    "accessModeGet":"required",
                    "accessModeAnno":"required",
                    "accessModeCondition":"-",
                    "edt":[  
                        {  
                            "elementName":"動作状態",
                            "elementSize":1,
                            "repeatCount":1,
                            "content":{  
                                "keyValues":{  
                                    "0x30":"ON",
                                    "0x31":"OFF"
                                }
                            }
                        }
                    ]
                },
                "0xB0":{  
                    "epcName":"運転モード設定",
                    "epcSize":1,
                    "accessModeSet":"required",
                    "accessModeGet":"required",
                    "accessModeAnno":"required",
                    "accessModeCondition":"-",
                    "edt":[  
                        {  
                            "elementName":"運転モード設定",
                            "elementSize":1,
                            "repeatCount":1,
                            "content":{  
                                "keyValues":{  
                                    "0x41":"自動",
                                    "0x42":"冷房",
                                    "0x43":"暖房",
                                    "0x44":"除湿",
                                    "0x45":"送風",
                                    "0x40":"その他"
                                }
                            }
                        }
                    ]
                }
            }
        },
        "0x0290":{  
            "objectName":"一般照明",
            "epcs":{  
                "0x80":{  
                    "epcName":"動作状態",
                    "epcSize":1,
                    "accessModeSet":"required",
                    "accessModeGet":"required",
                    "accessModeAnno":"required",
                    "accessModeCondition":"-",
                    "edt":[  
                        {  
                            "elementName":"動作状態",
                            "elementSize":1,
                            "repeatCount":1,
                            "content":{  
                                "keyValues":{  
                                    "0x30":"ON",
                                    "0x31":"OFF"
                                }
                            }
                        }
                    ]
                },
                "0xB0":{  
                    "epcName":"照度レベル設定",
                    "epcSize":1,
                    "accessModeSet":"optional",
                    "accessModeGet":"optional",
                    "accessModeAnno":"notApplicable",
                    "accessModeCondition":"-",
                    "edt":[  
                        {  
                            "elementName":"照度レベル設定",
                            "elementSize":1,
                            "repeatCount":1,
                            "content":{  
                                "keyValues":{  
                                    "0xFD":"設定値不明"
                                },
                                "numericValue":{  
                                    "integerType":"Unsigned",
                                    "unit":"%",
                                    "min":0,
                                    "max":100
                                }
                            }
                        }
                    ]
                }
            }
        }
    }
}
```

#詳細
　ECHONET機器オブジェクトを記述するJSON fileは以下の３つである。プログラムでのパースを容易にするために全く同じ構造で記述されている。

- ノードプロファイル用JSON file (nodeProfile.json)
- スーパークラス用JSON file (superClass.json)
- 機器オブジェクト用JSON file (deviceObject.json)

　以下にJSON fileの詳細な説明を行う。"//" を使って擬似的にコメントを付加している。

```jason
// This is pseudo JSON code to explain deviceObject.json
{
	"version":VERSION,									// VERSION(string) Appendix Release version, ex: "G"
	"date":DATE,										// DATE(string) JSON data の作成日, ex: "2016.07.21"
	"elObjects":{
		OBJ_CODE:{			 							// OBJ_CODE(string) オブジェクトコードをHEX表示, ex: "0x0130"
			"objectName":OBJ_NAME,	 					// OBJ_NAME(string) オブジェクト名, ex: "家庭用エアコン"
			"epcs":{
				EPC:{									// EPC(string) EPCをHEX表示(*1)。 ex: "0x80"
					"epcName":EPC_NAME,					// EPC_NAME(string) プロパティ名, ex: "動作状態"
					"epcSize":EPC_SIZE,					// EPC Size(integer) プロパティのデータサイズ(*2)。ex: 3
					"accessModeSet":AM_SET,				// AM_SET(string) Setのアクセスモード(*3)。
					"accessModeGet":AM_GET,				// AM_GET(string) Getのアクセスモード(*3)。
					"accessModeAnno":AM_ANNO,			// AM_ANNO(string) Annoのアクセスモード(*3)。
					"accessModeCondition":AM_CONDITION,	// AM_CONDITION(string) アクセスモードのcondition(*4)を記述。省略可。
					"edt": [{							// ELEMENTが複数ある場合を想定してArrayとする
						"elementName":ELEMENT_NAME,		// ELEMENT_NAME(string) ELEMENTの名前。
						"elementSize":ELEMENT_SIZE,		// ELEMENT_SIZE(integer) Elementのデータサイズ。
						"repeatCount":REPEAT_COUNT,		// REPEAT_COUNT(integer) Element繰り返し回数(*5)。
						"content":{						// 以下のオブジェクトのうち、該当するものを記述する。複数オブジェクトも可。
							"keyValues":KEY_VALUES,		// KEY_VALUES(JSON objects) Key-Value表現。ex: {"0x30":"ON", "0x31":"OFF"}
							"numericValue":{			// 数値データ
								"integerType":INT_TYPE,	// INT_TYPE(string) "Unsigned" or "Signed"
								"magnification":MAGNIFICATION,	// MAGNIFICATION(integer) 倍率を10のN乗表記した指数部。省略可。ex: -1(x0.1), 2(x100)
								"unit":UNIT,			// UNIT(string) 単位。省略可。ex: "℃"
								"min":MIN,				// MIN(integer) 最小値, ex: 0
								"max":MAX				// MAX(integer) 最大値, ex: 100
							}
							"level":{					// レベルデータの場合 (例：0x31(最小値レベル)〜0x38(最大レベル))
								"min":MIN,				// MIN(integer) 最小値, ex: 0
								"max":MAX				// MAX(integer) 最大値, ex: 100
							}
							"bitmap":[{					// bitmapの場合、bit(s)毎の定義をArrayに記述
								"bitName":BIT_NAME,		// BIT_NAME(string) 名前。 ex: "電気集塵方式"
								"bitRange":BIT_RANGE,	// BIT_RANGE([integer]) 対応するbit or bits。ex: [0], [0,1,2]
								"bitValues":BIT_VALUES	// BIT_VALUES(JSON objects) bit(s)の値とValue。ex: {"0":"ON", "1":"OFF"}
							}],
							"rawData":RAWDATA,			// RAWDATA(string) Raw Dataのtype。 "ASCII", "binary" or "ShiftJIS"
							"customType":CUSTOM_TYPE,	// CUSTOM_TYPE(string) EDTが別途定義した型(*6)
							"others":OTHERS				// OTHRERS(string) その他のデータ(*7)。
						}
					}]
				}
			}
		}
	}
}

// (*1) 値の範囲を示す場合は、"0x45...0xFF"と表記する
// (*2) 可変長データの場合は最大値
// (*3) ACCESS_MODE の候補値 "required", "optional", "notApplicable"
// (*4) "group-A": group-AのEPCのうちどれか一つが必須, "referSpec": 仕様書参照
// (*5) 繰り返しが固定回数でない場合は最大値とする。
// (*6) "YYMD":Year(2byte)+Month(1byte)+Day(1byte), "YYM", "HMS":Hour(1byte)+Minute(1byte)+Second(1byte), "HM", "HMF", "MS"
// (*7) "referSpec": 仕様書参照, "reserved": 予約済
```

#5 その他
　JSON fileを利用したサンプルプログラムとして、iOS向けにECHONET Lite 機器オブジェクト Viewerを開発した。
https://github.com/KAIT-HEMS/ELViewer
　このプロジェクト内のファイル _JsonStruct.swift_ を参照するとJSON dataの構造の理解が深まると思う。
