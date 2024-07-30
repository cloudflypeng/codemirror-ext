[简体中文](https://github.com/cloudflypeng/codemirror-ext/blob/main/README.cn.md)|[English](https://github.com/cloudflypeng/codemirror-ext)

This is an image upload plugin for CodeMirror that supports pasting or dragging and dropping images and uploading them to a server. The plugin allows using either a default fetch upload logic or custom upload logic.

```bash
npm install @meanc/codemirror-ext
```

Usage 


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

Configuration Options

	•	storageServer: The URL of the storage server, default is empty.
	•	upload: Custom upload function that returns an image URL. This function should accept a File object and return a Promise<string>.
	•	callback: A callback function to process the upload response and return the image URL.
