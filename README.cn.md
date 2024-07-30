
[简体中文](https://github.com/cloudflypeng/codemirror-ext/blob/main/README.cn.md)|[English](https://github.com/cloudflypeng/codemirror-ext)

这是一个基于 CodeMirror 的图片上传插件，支持通过粘贴或拖放图片并上传图片到服务器。该插件允许使用默认的 fetch 上传逻辑或者自定义的上传逻辑。

安装

```bash
npm install @meanc/codemirror-ext
```

用法

```javascript
import { EditorState, EditorView, basicSetup } from "codemirror";
import { markdown } from "@codemirror/lang-markdown";
import { PicUploadExt } from "@meanc/codemirror-ext";

// official upload logic
const imgUploadExt = PicUploadExt({
  storageServer: 'http://www.example/imagePut',
  callback: (res) => {
    return res.data.url;
  }
});

// custom upload logic
const customUpload = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch('http://www.example/imagePut', {
    method: 'POST',
    body: formData
  });
  const json = await res.json();
  return json.data.url;
};

const uploadCustomExt = PicUploadExt({
  upload: customUpload
});

// 初始化编辑器
const startState = EditorState.create({
  extensions: [basicSetup, markdown(), imgUploadExt] // 或者 uploadCustomExt
});

const view = new EditorView({
  state: startState,
  parent: document.body // 或者你的容器元素
});
```

配置选项

	•	storageServer：存储服务器的 URL，默认为空。
	•	upload：自定义上传函数，返回图片 URL。此函数应接受一个 File 对象并返回一个 Promise<string>。
	•	callback：处理上传结果的回调函数，返回图片 URL。
