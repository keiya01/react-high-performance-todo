# React Hight Performance Todo

- [About](#About)
- [Webpack](#Webpack)
  - [Code Splitting について](#Code-Splitting-について)
    - [なぜコードを分割するのか](#なぜコードを分割するのか)
    - [よくない方法](#よくない方法)
    - [コードの重複を防ぐ](#コードの重複を防ぐ)
    - [ダイナミックインポート](#ダイナミックインポート)
  - [Minify](#Minify)
  - [Tree Shaking](#Tree-Shaking)
  - [Dead Code Elimination](#Dead-Code-Elimination)
  - [Cache](#Cache)
    - [ブラウザ Cache について](#ブラウザ-Cache-について)
    - [strategy](#strategy)
      - [optimization.runtimeChunk](#optimization.runtimeChunk)
      - [optimization.cacheGroups.vendor](#optimization.cacheGroups.vendor)
  - [Bundle Size の調査](#Bundle-Size-の調査)
- [Performance](#Performance)
  - [クリティカルレンダリングパス](#クリティカルレンダリングパス)
  - [パフォーマンスバジェット](#パフォーマンスバジェット)
    - [方法](#方法)
    - [なぜ必要なのか](#なぜ必要なのか)
    - [ツール](#ツール)
  - [レンダリング](#レンダリング)
    - [仕組み](#仕組み)
    - [JavaScript パフォーマンス](#JavaScript-パフォーマンス)
    - [CSS パフォーマンス](#CSS-パフォーマンス)
  - [ローディングパフォーマンス](#ローディングパフォーマンス)
  - [HTTP キャッシュ](#HTTP-キャッシュ)
  - [RAILモデル](#RAILモデル)
- [最適なレンダリング手法](#最適なレンダリング手法)
  - [サーバーサイドレンダリング(SSR)](#サーバーサイドレンダリング(SSR))
  - [静的レンダリング](#静的レンダリング)
  - [クライアントサイドレンダリング(CSR)](#クライアントサイドレンダリング(CSR))
  - [どれを使えば良いか](#どれを使えば良いか)
- [PRPL](#PRPL)
- [App Shell](#App-Shell)
- [Service Worker](#Service-Worker)
  - [SWを使用できる条件](#SWを使用できる条件)
  - [ライフサイクル](#ライフサイクル)
  - [デバッグ](#デバッグ)
  - [SW を更新する](#SW-を更新する)
  - [注意点](#注意点)
  - [開発](#開発)
  - [SWを監視する](#SWを監視する)
  - [SWのパフォーマンス](#SWのパフォーマンス)
- [React](#React)
  - [React Performance](#React-Performance)
    - [re-render](#re-render)
    - [memo()](#memo())
    - [useMemo()/useCallback()](#useMemo()/useCallback())
    - [List](#List)
    - [コンポーネントを細かく分ける](#コンポーネントを細かく分ける)
    - [パフォーマンスの測定](#パフォーマンスの測定)
- [Redux](#Redux)
- [SSR](#SSR)
- [その他のツール](#その他のツール)

# About  
- React または SPA 開発に役立つ Webpack の設定や、Performance 改善の方法を調べた
- 少しずつ実装していき、ベストな方法を探っていきたい
- このリポジトリーでは React と TypeScript を使って開発している
- 基本的には Babel と Webpack を使って環境を構築している  

# Webpack  

## Code Splitting について  

### なぜコードを分割するのか
> コード分割は、ユーザが必要とするコードだけを「遅延読み込み」する手助けとなり、 アプリのパフォーマンスを劇的に向上させることができます。 アプリの全体的なコード量を減らすことはできませんが、ユーザが必要としないコードを読み込まなくて済むため、 初期ロードの際に読む込むコード量を削減できます。 

**参考**  
Code Splitting - React ... https://ja.reactjs.org/docs/code-splitting.html

### 分割の方法
Webpackの機能を使ってコード分割を行う。一番簡単な方法として、`entry`に複数のファイルを書いて分割する方法を思いつくかもしれないが、この方法だと、`entry`ファイルのそれぞれにmoduleがバンドルされてしまう。例えば、`index.js`と`another.js`が存在し、`another.js`で`lodash`を使っているが、`index.js`では使っていない状況を考える。この場合、`webpack`を使って`build`すると、`index.js`と`another.js`の両方に`module`がバンドルされてしまう。こうなってしまうとコードを分割してもコード量が増えてしまい、逆にオーバーヘッドになってしまう。これを避けるには`SplitChunksPlugin`を使う必要がある。

### コードの重複を防ぐ
コードの重複を防ぐには、`optimization.splitChunks.chunks`を`all`に設定する。しかし、`optimization.splitChunks.chunks`に直接`all`を指定すると、`splitChunks`の設定をみたす全てのコードが分割されてしまうことで頻繁に内容が更新されるコードも含まれることになり、キャッシュの恩恵を受けられないことがある([optimization.cacheGroups.vendor](#optimization.cacheGroups.vendor))。  

### ダイナミックインポート
ダイナミックインポート(`import()`)を使うことで、特定のファイルにbuild時の設定を組み込むことができたり、指定したmoduleを分割することができる。また、Reactを使っている時は、`lazy()`と`Suspense`コンポーネントを使うことで、コードを分割できる。SSRを使用している場合は [loadable-component](https://loadable-components.com/) を使うとコード分割を利用できる。  
`babel` を使用している場合は、[babel-plugin-syntax-dynamic-import](https://classic.yarnpkg.com/en/package/babel-plugin-syntax-dynamic-import) を使用しないと、`import()`が変換されてしまう可能性があるため、指定しておく。

### Reactにおけるコード分割
- [React.lazy](https://ja.reactjs.org/docs/code-splitting.html#reactlazy) を使用して、Dynamic Import を行い、コードを分割する
  - `React.lazy` は `default export` のみサポートしているため、名前付きエクスポートを使用している場合は、中間モジュールを作成して `export { MyComponent as default } from "./ManyComponents.js";` のようにデフォルトとして、再エクスポートするように実装する。
- [React.Suspense](https://ja.reactjs.org/docs/code-splitting.html#suspense) を使用して、Dynamic Import を非同期で読み込む
- [Error-Boundary](https://ja.reactjs.org/docs/error-boundaries.html) を使用して、読み込み時に発生したエラーをキャッチする
- ルーティング単位でコードを分割する時は、以下のようにする

```jsx

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';
import React, { Suspense, lazy } from 'react';

const Home = lazy(() => import('./routes/Home'));
const About = lazy(() => import('./routes/About'));

const App = () => (
  <Router>
    <Suspense fallback={<div>Loading...</div>}>
      <Switch>
        <Route exact path="/" component={Home}/>
        <Route path="/about" component={About}/>
      </Switch>
    </Suspense>
  </Router>
);

```

**参考**  
Code Splitting - Webpack ... https://webpack.js.org/guides/code-splitting/  
Code Splitting - React ... https://ja.reactjs.org/docs/code-splitting.html
Code Splitting - create-react-app ... https://create-react-app.dev/docs/code-splitting/

## Minify
Reactでは Production Mode でビルドすることで、自動的にminifyしてくれる(webpack v4 以降)

## Tree Shaking
`Tree Shaking`とはESMにおいて`export`されているが使われていないモジュールを洗い出してくれる機能である。この機能を使って洗い出されたコードはコメントで使われていない事が明示される。この明示されたコメントを基に`Terser`のような機能を使って使われていないモジュールの削除を行う。  
注意点として、この機能は`import`や`export`で表現された場合にしか機能しない。なぜなら、`require`/`module.exports`でモジュールを扱った場合、代入された値が最終的にどのような値になっているかは実行してみないとわからないのである。`import`/`export`でモジュールを扱った場合、トップレベルで宣言しなければエラーになるように設計されているため、静的解析が容易に行えるのである。  
webpackの`mode: 'development'`で`Tree Shaking`を確認するには`optimization.usedExports`を`true`にする必要がある。こうする事で`export`されているにも関わらず使用されていないモジュールにコメントが付く。  
また、`package.json`で`sideEffects: false(default true)`にすることでコードに副作用がないことを明示できるため、webpackが安全に`Tree Shaking`を行う事ができる。全てに依存関係がないと言えない場合も、`Array`を指定する事で副作用があるファイルを指定する事ができる。例えば、`polyfill`を読み込んでいるファイルや`css-loader`のような物を使っている場合は`*.css`を明示することで明示的に副作用をwebpackに伝える事ができる。  
`production`では`Tree Shaking`の設定は全て`true`になっているので、`sideEffects`を適切に設定する事が必要である。  
また、**注意すべき点**として、`Dynamic Import`を利用すると、`Tree Shaking`が行われないという問題がある。これは`import()`で返される値にアクセスできてしまうことから、`module`が書き換えられてしまっている可能性があるからである。ここに関しては`require()`と同じような問題を含んでいる。　　
  
**参考**
webpackの仕組みを簡潔に説明する ... https://blog.hiroppy.me/entry/mechanism-of-webpack  

## Dead Code Elimination
`TerserPlugin`を使って行われる。`mode: 'production'`では`default`でこれが適用されているため、基本は再設定する必要がないが、細かい設定が必要なときに追加で設定が必要となる。

## Cache  

### ブラウザ Cache について  
`webpack`で`output.filename`を`main.js`のように指定していると、ファイルの変更を検知できないため、キャッシュがうまく機能しない。
ブラウザーは初期読み込み時に静的ファイルをキャッシュに保存するが、その時にファイル名を見て更新されたかどうかを判断している。そのため、ファイル名が変更されていないとファイルを更新しても、表示が変わらないということがよくある。そのため`webpack`では`[name].[contenthash].js`のようにすることで、ファイルの変更のたびにファイル名が変更されるように設定できるようになっている。  
  
**参考**  
Caching - Webpack ... https://webpack.js.org/guides/caching/  

### strategy

#### optimization.runtimeChunk

runtimeをメインのコードから分けるために使用される。`single`を設定すると、runtimeが一つのfileにまとめられる。  

#### optimization.cacheGroups.vendor

`vendor`を設定すると、特定のmoduleのコードを分割することができる。更新頻度の少ないmoduleを分割することで、キャッシュを効率的に行うことができ、requestの回数を減らすことができる。例えば、`node_modules`は頻繁に更新される`module`ではないので、`node_modules`を分割することで効率的にキャッシュを行うことができる。  

```json
  {
    "optimization": {
      "runtimeChunk": "single",
      "cacheGroup": {
        "vendor": {
          "test": /node_modules/,
          "name": "vendors",
          "chunks": "all"
        }
      }
    }
  }
```

ここで`enforce`を`true`に設定する事で`splitChunks.minSize`、`splitChunks.minChunks`、 `splitChunks.maxAsyncRequests`、 `splitChunks.maxInitialRequests`を無視して`chunk`を作成する。  

**参照**  
Cache - Webpack ... https://webpack.js.org/guides/caching/  

## Bundle Size の調査
webpack を使用した場合、JavaScript が bundle されるために、1ファイルのサイズがとても大きくなってしまうことがある。そうなってしまうと、初期読み込みが遅くなってしまい、UX の低下をもたらす。この問題を解決するために有効な手段として使うのが [Performance Budgets](#Performance-Budgets) である。これを指標として、パフォーマンス改善を行っていく。
webpack には `webpack-bundle-analyzer` という Bundle Size を可視化するためのツールがあり、それを使うとスムーズ。カーソルを当てると、フィルサイズなどが表示されるので一つずつ改善していく。改善の仕方は、なぜそのファイルが重いのか、どのような用途で使われているかを調査する。その後、別ライブラリーで置き換えたり、自前で実装したりして、改善していく。

**参考**
webpackのbundle後のJavaScriptのサイズを減らしている話 - リクルート ... https://recruit-tech.co.jp/blog/2018/12/15/try_optimization_webpack_bundle_size/  

# Performance

## クリティカルレンダリングパス
- クリティカルレンダリングパスとは、HTML、CSS、 JavaScript のバイトの受信から、これらをピクセルとしてレンダリングするために必要な処理までの中間段階で行われている内容を理解してパフォーマンスの最適化を行うこと
- クリティカルレンダリングパスの最適化は、現在のユーザー操作に関連するコンテンツ表示の優先順位付けを意味する

## パフォーマンスバジェット

### 方法
バジェットには、Milestone・Quantity・Rulesの３つがある。  
**Milestone** はページのローディングなど、開始から完了までどのくらいの時間経過したかを測る指標で、First Contentful Paint や Time To Interactive, Speed Index などがある。これらの指標はユーザー中心で考えられているかが重要である。なぜなら一つの指標で判断してしまうとユーザーにとって価値のないものになる可能性があるからである。例えば、初期表示がすごく速いからと言って UX が向上するわけではなく、JavaScript のサイズが大きければ、読み込み時間が長くなり実行が遅れるため、JavaScript が読み込まれるまでユーザーはサイトを操作できないのでそのサイトにマイナスのイメージを持つかもしれない。そのため、初期表示のみを指標にせず、様々な側面から見ることが重要である。また、読み込みだけではなく操作性などについても注目する必要がある。
ユーザーが視覚的に得るフィードバックは4つある。**きちんと動作しているか**、**実用的か**、**使い勝手が良いか**、**快適か** である。これらを測るためにいくつかの指標がある。
1. First Paint(FP), First Contentful Paint(FCP) ... FPはピクセルを表示するタイミングで、FCP はテキスト、画像、SVG、Canvas を表示するタイミングであり、この指標が早くなることでユーザーはページが動いていることを確認できるため、**きちんと動作しているか** を測る指標となる。
2. First Meaningful Paint(FMP) ... 最も重要となる部分が表示されるタイミングを示すもので、**実用的か** を測る指標となる。最も重要となる部分はヒーロー要素と呼ばれ、Youtube の動画や天気アプリでは指定した地域の天気予報が当てはまる。このヒーロー要素の表示が速ければ他の要素が遅くても気にならない場合もある。
3. long tasks api ... 50ms以上かかるタスクを問題のあるタスクと判断し、通知してくれるAPIで、**快適か** を示す指標となる。
4. Time To Interactive ... アプリケーションが視覚的にレンダリングされて、ユーザー入力に確実に応答できるようになるタイミングの目印のことで、**使い勝手が良いか** を示す指標となる。メインスレッドがアイドル状態であることを示す。「ページを動作させるコンポーネントを作成するJavaScriptがまだ読み込まれていない」、「処理に時間のかかるタスクがメインスレッドを塞いでいる」といった場合に応答できない。

下記リンクを参考にした。ユーザーの端末でのパフォーマンスを計測するための具体的な方法も書いてある。  
https://developers.google.com/web/fundamentals/performance/user-centric-performance-metrics#top_of_page  

**Quantity** はアセットや通信量などの量を基準にした指標で、JavaScript のファイルサイズや HTTP リクエストの数、クリティカルレンダリングパスの数といった値の上限をバジェットとして設定する。

**Rules** は[PageSpeed Insights](https://developers.google.com/speed/pagespeed/insights/) や [Lighthouse](https://developers.google.com/web/tools/lighthouse/)、もしくは [WebPageTest](https://www.webpagetest.org/) などのパフォーマンス測定ツールで算出されたスコア。

### なぜ必要なのか
上記のメトリクスをパフォーマンスバジェットに設定しているサービスには、Pinterest がある。JavaScript のファイルサイズを 200 KB に抑えた上で 3G 環境で Time to Interactive を 6 秒以内に短縮し、収益が 44% 向上させた。また、Tinder はメインとなる JS ファイルを 160 KB に、非同期で読み込む JS の chunk ファイルを 50 KB に抑えるようにバジェットを設定したうえで、Time to Interactive を Pinterest と同じく 6 秒以内に短縮することで、ネイティブアプリよりもユーザーがより多くのスワイプをするという結果に繋げた。
モバイルサイトの速度とビジネス指標には相関関係があり、1 秒表示速度が改善されると、コンバージョン率が 27 % 改善されるというデータも存在する( https://developers-jp.googleblog.com/2019/03/blog-post_15.html?m=1/ )。以上の理由からパフォーマンスバジェットを設定して日頃からパフォーマンスを定量的に意識することが重要である。

### CIなどの監視ツール
- [Lighthouse Bot](https://github.com/GoogleChromeLabs/lighthousebot)はGitHubのプルリクエスト単位で、Lighthouseを実行、パフォーマンスやベストプラクティス、PWAといったLighthouseの各スコアをパスした場合のみマージすることができるように制限することができる。
- [bundlesize](https://github.com/siddharthkp/bundlesize)はアプリケーションのアセットファイルサイズをチェックするツールで、JavaScriptやアセットのサイズを制限したい時に便利
- [SpeedCurve](https://speedcurve.com/)は Speed Index や First Contentful Paint といったマイルストーンベースのメトリクスや、JavaScript のファイルサイズ、HTTP リクエストの数といった量ベースのメトリクス、さらには Lighthouse を使った計測も行うためルールベースのメトリクスもバジェットとして設定可能。また、バジェットを超過した際に Slack への通知といった機能も持っている。
その他にも、PageSpeed Insights API や WebpageTest を使って取得したデータを Google Sheets に記録、Google データポータル（旧データスタジオ）と連携して可視化するといった方法でもバジェットの運用を行うことができる。

**参考**  
パフォーマンスバジェット - Google Web Fundamentals ... https://developers-jp.googleblog.com/2019/03/blog-post_15.html

## レンダリング

### 仕組み
- アニメーションがスムーズに見えるのは１秒間に60回リフレッシュ(60fps)する時である
- ブラウザ側でのレンダリング処理もあるため、60fpsを保つために全てのタスクは10ms以内に完了する必要がある
- タスクを実行すると、JS -> Style(CSSがどの要素にマッチするか) -> Layout(幅や高さ、位置などを計算して適用。子のStyleにも影響する) -> Paint(色や影、線などの描画が行われる) -> Composite(要素の重なりを計算する) の順でレンダリングが実行される
- Layoutが最も重い処理となり、次にPaintが重い。高頻度でStyleが変更される場合、Compositeのみで処理される`transform`と`opacity`に絞った方が良い。
- [css trigger](https://csstriggers.com) を見ると、どの要素がどこで適用されるのかわかる

### JavaScript パフォーマンス
- タイミングの悪いスクリプトや長時間実行されるスクリプトはパフォーマンス低下の原因になる
- フレームがずれて実行される可能性があるため `setTimeout` や `setInterval` を使用するのを避けて `requestAnimationFrame` を使用するようにする
- スクロール操作のようなアニメーションでは、JavaScript の実行時間を 3～4 ミリ秒に抑えることが理想的
- DOM操作を必要としない検索やソートなどのデータ操作またはトラバーサルといった長時間実行されるスクリプトは `Web Worker` に移動する
- マイクロタスクを使用して、複数のフレームに渡ってDOMを変更する
- Chrome DevTools の Performance で Scripting の時間を計測し、JavaScript の影響を評価する
- `preventDefault`の有無を知らせるために、`addEventListener`の第3引数には`{passive: true}`を指定する。これにより、ブラウザが`preventDefault`が発生した時の準備をする必要がなくなり、処理が軽くなる
- scroll イベントのような長時間実行されるようなイベントの場合、アニメーションがスムーズに動かない時がある。その時は、`requestAnimationFrame`を使って正しいタイミングのフレームで実行するようにスケジュールすれば、スムーズに動くようになる
  - 特にスクロールイベント中に要素の位置やサイズを取得してからからスタイルに変更を加えているような処理を実装している場合、スクロールイベントで要素の正しい位置やサイズを取得するためにレイアウト処理の後にスケジュールされるため、アニメーションが正しく動作しない可能性がある。このような場合、上記の対応が必要である
- 細かい最適化として、**要素の offsetTop の要求は getBoundingClientRect() の計算よりも高速** というものなどがあるが、ゲームなどの高度な処理が必要でない限りこの最適化は拘らなくても良い(新規で作る場合は意識してもよさそう)

### CSS パフォーマンス

#### Layout
- :nth-last-child(-n+1)のような処理は一致する要素を探すために全ての要素を確認する必要があるため固有のclass名をつけたほうが良い
- dev tools の timeline タブを使うことでstyle計算の処理時間を見ることができる
- float よりも flexbox の方が高速
- レイアウト処理(width, height, z-index, position, etc...)を変更するとドキュメント全体に適用され、計算量が多くなるため出来るだけ変更するのを避ける
- ある要素からレイアウトを参照しようとする時(offsetHeightなど)に、レイアウトの変更を行ってから参照しようとすると、ブラウザは正しい結果を返すために変更されたレイアウトを計算してから結果を参照できるようにするため、参照が遅れる。そのためレイアウトを参照してから変更するようにしたほうが良い

#### Paint
- 文字色・背景色・影などの Paint 処理で行われるプロパティーの変更はとても重い処理になるため、避ける
- DevTools を開いて、`esc` key を押して、 Rendering タブの Show paint rectangles を使うと Paint 処理がどこで行われているか見ることができる
- Performance タブで paint を計測することで、処理時間を確認することができる
- `will-change`や`transfrom: translateZ(0)`を使うことでコンポジ層を作成することができ、コンポジ層を作成することで、他の要素に影響を与えることなく、styleを変更することができるが、メモリーの管理が必要となるため、不必要に使ってはいけない。使う時には、使う前のパフォーマンスと使った後のパフォーマンスをしっかり計測した上で、メリットがある場合のみ使用すべきである。

#### アニメーション
- 基本的に要素に変化をつける場合、`transform`と`opacity`を使うようにする
- 上記以外のアニメーションを行いたい場合、 [FLIP](https://aerotwist.com/blog/flip-your-animations/) を参照すると良い
- より複雑な処理の場合、`will-change`を使うこともできるが多用することでユーザーのGPUを過剰に使用することになり、パフォーマンスが逆に落ちてしまう可能性もある
- DevTools の バブルボタンをクリックして、more tools を押すと、layer というアイテムがあり、そこから現在のレイヤーの数や動きを見ることができる

**参考**  
レンダリング パフォーマンス - Google Web Fundamentals ... https://developers.google.com/web/fundamentals/performance/rendering?hl=ja  
猫でもわかるスクロールイベントパフォーマンス改善ポイント2018 - Qiita ... https://qiita.com/kikuchi_hiroyuki/items/7ac41f58891d96951fa1#requestanimationframe  

## ローディングパフォーマンス [WIP]

**参考**  
Loading Performance - Google Web Fundamentals ... https://developers.google.com/web/fundamentals/performance/get-started?hl=ja [WIP]

## HTTP キャッシュ [WIP]

**参考**  
HTTP キャッシュ - Google Web Fundamentals ... https://developers.google.com/web/fundamentals/performance/optimizing-content-efficiency/http-caching?hl=ja  

## RAILモデル
RAILモデルはユーザーを中心に考えるパフォーマンスモデルである。全てのウェブアプリのライフサイクルには Response・ Animation・Idle・Load の4つの側面があり、これらに適したパフォーマンスはそれぞれ異なる。  
  
**ユーザーを第一に考えます。最終目標は、特定の端末でのサイトの処理速度をあげることではありません。ユーザーが満足感を得ることが最終目標です。**  
  
**ユーザーに対して即座に応答します。ユーザー入力は100ミリ秒以内に認識します。**  
- ユーザーがサイトに費やす時間の大半が、サイトの読み込みを待つ時間ではなく、サイトを使用しながらレスポンスを待つ時間になるようにする。
- 0 ~ 100 ミリ秒 ... ユーザーはすぐに結果を得られたと感じる。
- 100 ~ 300 ミリ秒 ... やや遅いと感じる。
- 300 ~ 1,000 ミリ秒 ... 途切れることなく自然にタスク(読み込みや遷移)が進んでいると感じられる。
- 1,000 ミリ秒以上 ... 実行したタスクへの関心を失う
- 10,000 ミリ秒以上 ... タスクを中断し、そのまま戻ってこない可能性がある
- 500ミリ秒以上かかる場合はフィードバックを提供する必要

**アニメーションやスクロールでは、10 ミリ秒以内にフレームを生成します。**  
- アニメーションは 60fps を目指す必要があるが、ブラウザが新しいフレームを画面に描画する必要があることを考えると、アニメーションをコードで実行できる時間は 10 ミリ秒程度であるため、必要最小限の処理に留める必要がある。
- 負荷の高い処理を 100 ミリ秒に収まるように事前に実行しておき、60fpsに収まるように工夫するのも良い

**メインスレッドのアイドル時間を最大限に活用します。**  
- データのプリロードを最小限に抑えて、アプリの読み込みを高速にし、残っているデータはアイドル時間に読み込むようにする
- 遅延している作業は 50 ミリ秒程度のブロックにグループ化する
- ユーザーが操作を始めた場合はレスポンスを返すことを優先する
- 100 ミリ秒以内にレスポンスを返すためには、アプリで毎回 50 ミリ秒以内にメインスレッドに制御を返す必要がある

**ユーザーの作業を妨げません。インタラクティブ コンテンツは1000ミリ秒以内に提供します**
- サイトは1秒以内に読み込まれたと感じられなければ、ユーザーの集中力がきれ、タスクの操作に失敗したと感じる
- 読み込みが終わったと感じられれば良いため、優先度順に読み込み、レスポンスを返せば良い

**参考**  
RAIL モデルでパフォーマンスを計測する - Google Web Fundamentals ... https://developers.google.com/web/fundamentals/performance/rail?hl=ja


# 最適なレンダリング手法 

## サーバーサイドレンダリング(SSR)
SSR はナビゲーションに応じたサーバー上のページのために、完全な HTML を生成する手法。この手法ではブラウザにレスポンスを返す前に、サーバー内で HTML を生成するため、データのフェッチとクライアント上で DOM を作成する作業が回避される。そのため SSR は、高速な FP(First Paint) と FCP(First Contentful Paint) を実現する。また、サーバー上でページのロジックとレンダリングを行うため、JavaScript をクライアントへ大量送信することを避けることができる。これにより、TTI(Time To Interactive) を短時間で達成できる。つまりサーバー上でレンダリングを行うため、クライアントで必要な JavaScript のサイズが少なくなり、初期表示が格段に早くなるのである。
しかし、SSR には欠点もある。それは TTFB(Time To First Byte) が遅くなるのである。ユーザーがページを移動する時にサーバー上で新しく HTML をレンダリングするなどの処理を行うため、遷移後のページの表示が遅くなってしまう。この欠点は、CSR と SSR を組み合わせる(ハイブリットレンダリング)ことで解決できる。リクエストの多いページではSSRを使用し、それ以外の部分ではCSRを使用するように工夫することでそれぞれのメリットを生かしたレンダリングを行うことができる。
また、SSR は正しく最適化しなければ初期表示が高速化するといったメリットの恩恵を受けることができないこともある。SSR は基本的には Node.js で行われるが JavaScript はシングルスレッドであるため多くのリクエストを捌く工夫や、キャッシュの有効活用、メモリ消費の管理、メモ化などの最適化が必要となる。
SSR ではリハイドレーションという、サーバー側で生成された HTML と クライアント側のビューを同期させることで JavaScript と対話可能にするもので、これが行われることにより TTI が遅くなってしまうことがある。現在ではプログレッシブ リハイドレーションという手法を React などのフレームワークでも探っている状態で、これはハイドレーションを少しづつ行うことでメインスレッドを出来るだけアイドル状態にしておき、イベントとの対話を防がないようにするものである。

## 静的レンダリング
静的レンダリングはビルド時に行われ、最速の FP と FCP 、TTI を実現する。サーバーサイドレンダリングのように HTML をリクエストに応じて生成するのではなく、事前に HTML をビルドしているため一貫して最速の TTFB を達成することが可能である。通常、静的レンダリングは、各 URL に対応する個別の HTML ファイルを前もって作成しているため、HTML のリクエストが予め生成されているので、複数の CDN をデプロイし、エッジキャッシュを活用することができる。
静的レンダリングの欠点は、すべての有効な URL に対し、個々に HTML ファイルを生成しなければならないことである。これらの URL が事前に、多くの固有ページを持つサイトであるか予測できない場合に実装が難しくなるため向かない。JavaScript を無効にしたときに、正しく動くページは静的レンダリングに向いていて、コンテンツが欠けてしまうようなページは静的レンダリングに向いていない。

## クライアントサイドレンダリング(CSR)
CSR は JavaScript を使用し、直接ブラウザでページをレンダリングする手法である。全てのロジック、データフェッチ、ルーティングはなどの処理はクライアントで行われる。CSR は JavaScript を取得・ロードしてからレンダリングされるため、初期表示を早くしたり、モバイルでの表示を高速にするのが難しい場合がある。しかし、JavaScript のバジェットを最小限に抑え、応答時間を早くすることができれば、SSR のパフォーマンスに近づくことができる。HTTP/2 サーバー通知や、`<link rel="preload">`を使うことでクリティカルなスクリプトとデータをすぐに配信することができる。[PRPL](#PRPL) のようなパターンは CSR で初期表示を早くするために有効な手法。
CSR では規模が大きくなるにつれて、バンドルサイズが大きくなるため、必要な時だけ必要な処理を読み込むようにするために、積極的にコード分割を行う必要がある。また、App Shell モデルを取り入れて、キャッシュを有効活用することも重要である。

## どれを使えば良いか
- SSR ... FP や FCP などの初期表示を早くしたいサービスや大規模なサービスに向いている
- 静的レンダリング ... ドキュメントなどの予め、構成が決まっていて、ルーティングが定まっているようなサイト
- CSR ... 小 ~ 中規模のサービスでTTIやTTFBのようなイベントに対する反応を速くしたいようなサービス

**参考**  
Web上のレンダリング - Google Web Fundamentals ... https://developers.google.com/web/updates/2019/02/rendering-on-the-web?hl=ja  

# PRPL [WIP]
**参考**  
Apply instant loading with the PRPL pattern - web.dev ... https://web.dev/apply-instant-loading-with-prpl/ [未読]  

# App Shell 
App Shell とはネイティブのように瞬時に、そして確実にユーザーの画面に読み込める Progressive Web App(PWA) を構築するための方法の1つである。Shell とは CSS・HTML・JavaScript のことで、キャッシュしておくことで、瞬時に高いパフォーマンスを発揮できる仕組みのこと。
JavaScript を多用したアーキテクチャーのシングルページアプリケーションに対しては App Shell が有力なプローチとなる。Service Worker を使用して積極的に Shell をキャッシュして、次に JavaScript を使用して各ページの動的コンテンツを読み込む。App Shell は最初の HTML コンテンツを高速で画面に表示するのに役立つ。また、App Shell は UIの骨組みであり、データを含まない。  
App Shell には以下の要件が求められる。

- 瞬時の読み込み
- 最小限のデータ使用量
- ローカルのキャッシュから静的アセットを使用
- コンテンツとナビゲーションの分離
- ページ固有のコンテンツと表示(HTML, JSON など)
- 必要に応じた動的コンテンツのキャッシュ

App Shell モデル - Google Web Fundamentals ... https://developers.google.com/web/fundamentals/architecture/app-shell?hl=ja  
Next.js ... https://nextjs.org/docs/getting-started  

# Service Worker  
Service Worker(SW) はブラウザが Web ページとは別にバックグラウンドで実行するスクリプトで、Web ページやユーザーのインタラクションを必要としない機能を Web にもたらす。現在では、プッシュ通知やバックグラウンド同期が使用できる。これにより、オフラインや通信の遅い環境での体験を向上させることができる。

## SWを使用できる条件
- ブラウザーがサポートしている
- HTTPSであること

## ライフサイクル
SW を登録すると、ブラウザは SW をバックグラウンドでインストールする。インストール中にいくつかのアセットをキャッシュする。この時に1ファイルでもキャッシュの保存に失敗するとインストールは失敗し、再インストールされる。インストールに成功すると、アクティベーション処理に移行し、古いキャッシュを処理する。これが終わると、SW はページを制御するが、登録時点では制御されず次に読み込まれた時に制御されるようになる。

## デバッグ
- chrome://inspect/#service-workers や chrome://serviceworker-internals で SW が有効か確認できる
- chrome://serviceworker-internals にアクセスし、[Open DevTools window and pause JavaScript execution on service worker startup for debugging] にチェックを入れて、install イベントの開始時に debugger 文を記述して、[Pause on uncaught exceptions](https://developers.google.com/web/tools/chrome-devtools/javascript/breakpoints?hl=ja) とともに使用すると問題を発見できる

## ライフサイクル
1. `register()`を使い、SW を登録する。
  - この時、初めてサイトに訪れた場合はすぐ SW を登録し、すでに存在する場合、SW はファイルサイズを比較して、ファイルのサイズが増えていれば更新する
2. `install` イベントが呼び出される
  - `install` イベントでは主にアセットのキャッシュを行う
  - キャッシュを開く -> キャッシュを保存する -> キャッシュが完了したことを確認する

```js

var CACHE_NAME = 'my-site-cache-v1';

/**
 *  キャッシュさせたいファイルを配列で宣言する
 *  ファイル数が多くなると、キャッシュに失敗してSWのインストールが成功しない可能性もある
*/
var urlsToCache = [
  '/',
  '/styles/main.css',
  '/script/main.js'
];

self.addEventListener('install', function(event) {
  /**
   * waitUntil() はインストールにかかる時間とインストールが成功したかどうかを知るために使われる
   * cache.addAll()の結果を返すことで成功かどうかを判断する
  */
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

```

3. キャッシュのレスポンスを返す
- SW がインストールされた状態で他のページへ遷移したりページを更新したりすると SW は `fetch` イベントを受け取る

```js

self.addEventListener('fetch', function(event) {
  /**
   * cache.respondWith()は受け取った結果をレスポンスするためのメソッド
   * キャッシュが見つかった場合はキャッシュを返し、そうでない場合は`fetch`への呼び出しの結果を返す
  */
  event.respondWith(
    /**
     * cache.match()はリクエストを確認して、SW がキャッシュしたデータの中から一致したキャッシュ全てを返す
    */
    caches.match(event.request)
      .then(function(response) {
        // キャッシュがあればresponseを返す
        if (response) {
          return response;
        }
        // キャッシュがない場合はfetchする
        return fetch(event.request);
      }
    )
  );
});

```

- 新しいリクエストを逐次キャッシュさせたい場合は、以下のように書く

```js

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }

        /**
         * [重要]
         * リクエストはストリームであるため一度しか利用することができない。
         * cacheとbrowserで1回ずつfetchを利用しているため、必ずクローンして利用する。
        */
        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            /**
             * 正しいレスポンスを受け取ったか確認する
             * response.type !== 'basic' はリクエストの送信元と送信先のドメインが
             * 同じであることを確認している
            */ 
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            /**
             * [重要]
             * レスポンスはストリームであるため1回しか利用できない。
             * ここではブラウザーとキャッシュで使うため、クローンする必要がある。
            */
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

```

4. SW を更新する
- JS が更新されるとブラウザは SW をダウンロードし、バイト数に差がある場合、新しいものとして判断される。
- SW がインストールされると、サイトが閉じられるまで古い SW が制御権を持ち、新しい SW は`waiting`状態となる
  - `waiting`することなくすぐに新しい SW に制御権を持たせたい場合は、`self.skipWaiting()`を使う。このメソッドは通常は`install`イベント内で呼び出される。
  - `self.skipWaiting()` は、古いバージョンで読み込まれたページを新しい SW で制御することを意味するため、ページの`fetch`の一部は古い SW で処理され、その後の`fetch`は新しい SW で処理される事になる。これが問題になる可能性がある場合は、`self.skipWaiting()`を使用しない。
- サイトが閉じられると、新しい SW が制御権を持ち、`activate`イベントが起こる
- `activate`イベントでは、古いキャッシュを削除するためにキャッシュの管理を行う
  - `activate`イベント内で`cache.claim()`を使うことで、再読み込みせずに SW がページを制御できるようになるが、通常は`cache.claim()`を使わなくても正常に動作するはずであるため、必要ない

```js

/**
 * ホワイトリスト以外のキャッシュを削除する処理 
*/
self.addEventListener('activate', function(event) {

  var cacheWhitelist = ['pages-cache-v1', 'blog-posts-cache-v1'];

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

```

- ユーザーが再読み込みすることなく長時間利用できるようにするために以下のように手動でアップデートすることができる

```js

navigator.serviceWorker.register('/sw.js').then(reg => {
  // sometime later…
  reg.update();
});

```

## 注意点
- `fetch()`は認証情報(Cookieなど)を自動で付与しないため、`fetch(URL, {credentials: 'include'})`と指定する必要がある
- `no-cors`オプションを設定するとレスポンスが成功したか判断できない
- レスポンシブな画像をキャッシュする時に、全ての画像をキャッシュするのはストレージスペースの無駄使いなので、以下のように低解像度の画像か高解像度の画像どちらか一つをキャッシュするようにマークアップする

```html
  <img src="image-src.png" srcset="image-src.png 1x, image-2x.png 2x" 
    style="width:400px; height: 400px;" />
```

## 開発
- DevTools の Application タブ の Servise Worker を開くと、ステータスを確認したり、開発に役立つ細かい設定ができる
- update on reload にチェックマークをつけると、リロードごとに SW がアップデートされるようになる
- `waiting`状態の SW がある場合に、skipWaiting を押すと、`waiting`状態がスキップされる

## SWを監視する
```js

navigator.serviceWorker.register('/sw.js').then(reg => {
  reg.installing; // the installing worker, or undefined
  reg.waiting; // the waiting worker, or undefined
  reg.active; // the active worker, or undefined

  reg.addEventListener('updatefound', () => {
    // A wild service worker has appeared in reg.installing!
    const newWorker = reg.installing;

    newWorker.state;
    // "installing" - the install event has fired, but not yet complete
    // "installed"  - install complete
    // "activating" - the activate event has fired, but not yet complete
    // "activated"  - fully active
    // "redundant"  - discarded. Either failed install, or it's been
    //                replaced by a newer version

    newWorker.addEventListener('statechange', () => {
      // newWorker.state has changed
    });
  });
});

navigator.serviceWorker.addEventListener('controllerchange', () => {
  // This fires when the service worker controlling this page
  // changes, eg a new worker has skipped waiting and become
  // the new active worker.
});

```

## SWを登録する
SW を登録する時によく見るボイラープレートは以下のようなものである。

```js
if ("serviceWorker" in navigator) {
  naigator.serviceWorker.register("./service-worker.js");
}
```

しかし、この書き方だと、帯域幅の狭くリソースの少ないモバイルでは SW のバックグラウンドでのインストールにより、インタラクティブなページのレンダリングが遅くなってしまう。
この問題を解決するために、以下のように SW をインストールするタイミングを遅らせる必要がある。

```js

if ('serviceWorker' in navigator) {
  window.addEventListener('load', function() {
    navigator.serviceWorker.register('/service-worker.js');
  });
}

```

上記のようにWebアプリケーションが読み込まれたタイミングで SW を遅らせるのが一般的な問題へのアプローチであるが、ケースに合わせて読み込みのタイミングを変更する必要がある。

> Google I/O 2016 ウェブアプリは、メイン画面に遷移する前に短いアニメーションを表示します。 Google のチームは、アニメーションの表示中に Service Worker 登録を開始すると、ローエンドのモバイル端末でアニメーションの品質が低下する場合があることを発見しました。 ブラウザが数秒間アイドル状態になる可能性が高い場合、ユーザーに不快感を与えないよう、アニメーションが終わるまで Service Worker 登録を遅らせました 。
引用: https://developers.google.com/web/fundamentals/primers/service-workers/registration?hl=ja

読み込みのタイミングをテストするには、シークレットウィンドウの DevTools でネットワークトラフィックを確認することで、SW がインストールされているタイミングを調べることができる。

## SWのパフォーマンス
> ウェブ パフォーマンスの最終的な目標は、ネットワークに依存するナビゲーション リクエストを使わなくてよいように、サブリソースのアグレッシブ キャッシュを最大限に活用することです。 Service Worker をサイト独自のアーキテクチャに合わせてきちんと構成して使用することで、それが可能になりました。
引用: https://developers.google.com/web/fundamentals/primers/service-workers/high-performance-loading?hl=ja  
  
Web アプリケーションに SW を追加する最大の効果は、ページを読み込んだ時に発生するナビゲーションリクエストに応答する際にネットワーク通信による遅延がないこと。さらに SW はストリーミングでデータを読み込むため、レスポンスの最初の部分をより速く返すことができる。  
  
また SW には それぞれのケースに合わせて、様々なキャッシュ戦略が存在する。またこれらの戦略を実装するときは [WorkBox](https://workboxjs.org) を使うと便利。  
`stale-while-revalidate`、`cache-first`、`App Shell`モデルなどがある。

- `stale-while-revalidate`はHTML などの静的リソースのキャッシュに向いており、SW で一度キャッシュしたら次回以降はキャッシュを優先してレスポンスを返し、裏側で最新のデータを`fetch`しておき、次回のアクセスで最新のキャッシュをレスポンスするようにする戦略である。頻繁に更新が行われるが、
- `cache-first`はキャッシュを最初に確認し、キャッシュがなければ、ネットワークから取得する戦略である。オフラインファーストのアプリを作成するときにこのパターンが適用される。`create-react-app`のデフォルトでもこのパターンが使用されている。
- `App Shell`モデルは SPA にとても向いているモデルで、静的ファイルをキャッシュしておくことでレスポンスを速くするパターン。

詳しくは[オフライン クックブック](https://developers.google.com/web/fundamentals/instant-and-offline/offline-cookbook/?hl=ja)を見ると便利。  
  
**参考**  
Service Worker について - Google Web Fundamentals ... https://developers.google.com/web/fundamentals/primers/service-workers?hl=ja  

# React [WIP]  

## React Performance  

Reactでのパフォーマンス改善の鍵は、無駄な再レンダリングを抑えることと、サイズを最小限に抑えることだと考える。無駄な再レンダリングを抑える必要があるのは、JavaScriptはシングルスレッドで動作する言語であるため、一つの処理がメインスレッドを占有してしまうと、他の処理が動作しなくなってしまう。つまり、再レンダリングによって無駄なスクリプトが走ることですぐに実行したいスクリプトの実行が遅れてしまうのである。サイズを抑える必要があるのは、JavaScriptをブラウザにできるだけ早く読み込んでもらい、できるだけ早く実行するためである。

### re-render
React では 再レンダリングをできるだけ減らす必要があります。その方法は大きく分けて2つあります。1つ目は再レンダリングするコンポーネントの影響範囲を出来るだけ狭くすることである。ページ単位でstateを持たせない、props のバケツリレーを出来るだけしない、Redux から受け取るstateを親要素に持たせず必要なコンポーネントのみに持たせるようにするといったことが重要。2つ目はレンダリングが不要な要素に`shouldComponentUpdate`や`memo`を使って、再レンダリングを抑えるようにすることである。

### memo()
React の FC でコンポーネントを実装する場合、最適化の方法として`memo()`を使う方法がある。`memo()`は無制限に使っていいわけではなく、考えて使わなければならない。`memo()`の使い所は次の2つのケースである。

1. props や state を使用していないコンポーネント
2. レンダリングの抑制のために、第二引数に条件をしっかり記述して使用する

`memo()`の特徴として、第二引数に何も関数を指定しなかった場合、`Shalow Equal`が走るため、メモ化するコストとメモ化しないコストを比較した時に後者の方がパフォーマンスが良くなってしまうのである。そのため、`Shallow Equal`の影響を受けない **props や state を使用していないコンポーネント** で使うケースか、`Shallow Equal`を使用しないで **レンダリングの抑制のために、第二引数に独自の条件をしっかり記述して使用する** ケースでの利用に絞った方が良いと考えられる。

### useMemo()/useCallback()
`useMemo()`と`useCallback()`の利用は使う場面に困ることが多いが、基本的に使い所は2つだと考える。

1. 複雑な処理を記述しているような部分や、再レンダリングが多く起こるコンポーネント
2. `useEffect()`との依存関係を明確にする場合

**複雑な処理を記述しているような部分や、再レンダリングが多く起こるコンポーネントで** についてはわかりやすいと思うが、**useEffect()との依存関係を明確にする場合** については、[useEffect完全ガイド](https://overreacted.io/ja/a-complete-guide-to-useeffect/) を見てもらえれば理解してもらえると思う。簡単に言えば、`useEffect()`の中でコンポーネント内の値に依存する変数や関数を使っていて、その依存する変数や関数を`useEffect()`の外で定義する場合、依存関係がわかりにくくなるため、`useCallback()`や`useMemo()`を使って関数や変数の依存関係を明確にした方が可読性がよくなるといったものである。

### List
Reactではリスト形式のUIを差分レンダリングしているため、アイテムにkey要素を指定しないと、アイテムが追加されるたびに再レンダリングされてしまったり、うまく動作しないことがある。また、key要素にrandomな値やindexを指定してもうまく動作しなかったり、リスト全体が再レンダリングされてしまい、パフォーマンスの低下をもたらすので、各アイテムに固有の一意なIDをつける必要がある。さらにリスト形式のUIの場合でデータ量が多い場合、際レンダリングにかなりのコストが生じるので、`shouldComponentUpdate`や`memo`、`PureComponent`などを使って、再レンダリングを抑制する必要がある。

### コンポーネントを細かく分ける
Reactでは再レンダリングを抑制するための手段が各コンポーネントに対して1つしかない(1つのコンポーネントに対して`memo`や`PureComponent`を使えるのは1つ)。そのため、あるコンポーネントに高頻度で変更されるデータを保持していてFatなコンポーネントである場合、無駄な要素まで再レンダリングされる可能性がある。そうならないためにも、できるだけ小さい単位でコンポーネントを分割して、再レンダリングを抑制する必要がある。

### 表示されていない領域のDOMを生成しないようにする
長いデータのリスト（数百〜数千行）をレンダーする場合、実際に画面には写っていない部分も再レンダリングされてしまい、処理が無駄になってしまう。そのため見えている部分のみ画面に表示して、無駄な処理を減らす必要がある。`react-virtualized`が有名だが、`react-window`の方が軽量でよさそう。`react-vertualized`のGitHubにも`react-window`の方が軽いと書かれている。

### パフォーマンスの測定
パフォーマンスを計測する時には、Production Mode でビルドしてから計測することが大切である。なぜなら、Developmet Mode で計測してしまうと、Development 用の Error や Worning の処理が含まれてしまい、Production Mode と比べて Performance が落ちてしまう可能性があるため。また、デプロイするときも Production でデプロイすることを忘れないようにすることも大切。

- Chrome Dev Tools ... Performanceパネルでレンダリング測定・NetworkパネルでAPIとの接続測定
- React Dev Tools ... Highlight Update を使って差分レンダリングの確認
- @welldone-software/why-did-you-render ... 再レンダリングしている箇所とその理由、無駄に再生成されているデータを教えてくれる

**参考**  
パフォーマンス最適化 - React ... https://ja.reactjs.org/docs/optimizing-performance.html  
お前らのReactは遅い - Qiita ... https://qiita.com/teradonburi/items/5b8f79d26e1b319ac44f  
本当は怖いReact.memo - Qiita https://qiita.com/suzuesa/items/1bb3b1493ff526814f03  
React製のSPAのパフォーマンスチューニング実例 - リクルート ... https://recruit-tech.co.jp/blog/2018/09/19/react_spa_performance_tuning/  

# Redux [WIP]
- 無駄な再レンダリングを抑制するために、Redux Storeに値を持たせるのはほとんど全てのコンポーネントで必要となるデータのみに絞る(user info など)
- 各コンポーネントで使うデータは各コンポーネントで宣言してしまう方がわかりやすい

# SSR [WIP]
**参考**  
Speedier Server-Side Rendering in React 16 with Component Caching - medium ... https://medium.com/@reactcomponentcaching/speedier-server-side-rendering-in-react-16-with-component-caching-e8aa677929b1 [未読]  
Hastening React SSR with component memoization and templatization - Speaker Deck ... https://speakerdeck.com/maxnajim/hastening-react-ssr-with-component-memoization-and-templatization [未読]  

# その他のツール
- モバイルフレンドリー テスト ... https://search.google.com/test/mobile-friendly?hl=ja
