"use strict";const t=require("electron");t.contextBridge.exposeInMainWorld("electron",{ipcRenderer:{getTasks:()=>t.ipcRenderer.invoke("get-tasks"),createTask:e=>t.ipcRenderer.invoke("create-task",e),updateTask:(e,r)=>t.ipcRenderer.invoke("update-task",{id:e,data:r}),deleteTask:e=>t.ipcRenderer.invoke("delete-task",e),completeTask:e=>t.ipcRenderer.invoke("complete-task",e),getTrees:()=>t.ipcRenderer.invoke("get-trees"),createTree:e=>t.ipcRenderer.invoke("create-tree",e),growTree:e=>t.ipcRenderer.invoke("grow-tree",e),getCategories:()=>t.ipcRenderer.invoke("get-categories"),createCategory:e=>t.ipcRenderer.invoke("create-category",e),updateCategory:(e,r)=>t.ipcRenderer.invoke("update-category",{id:e,data:r}),deleteCategory:e=>t.ipcRenderer.invoke("delete-category",e),invoke:(e,...r)=>["get-tasks","create-task","update-task","delete-task","complete-task","get-trees","create-tree","grow-tree","get-categories","create-category","update-category","delete-category"].includes(e)?t.ipcRenderer.invoke(e,...r):Promise.reject(new Error(`通道 "${e}" 不在允许列表中`)),on:(e,r)=>{if(["main-process-message","task-updated","tree-updated"].includes(e)){const o=(l,...d)=>r(...d);return t.ipcRenderer.on(e,o),()=>{t.ipcRenderer.removeListener(e,o)}}return console.error(`通道 "${e}" 不在允许列表中`),()=>{}},send:(e,...r)=>{["from-renderer","refresh-tasks","refresh-trees"].includes(e)?t.ipcRenderer.send(e,...r):console.error(`通道 "${e}" 不在允许列表中`)}}});window.addEventListener("DOMContentLoaded",()=>{t.ipcRenderer.send("from-renderer","Preload script loaded")});function s(e=["complete","interactive"]){return new Promise(r=>{e.includes(document.readyState)?r(!0):document.addEventListener("readystatechange",()=>{e.includes(document.readyState)&&r(!0)})})}const a={append(e,r){Array.from(e.children).find(n=>n===r)||e.appendChild(r)},remove(e,r){Array.from(e.children).find(n=>n===r)&&e.removeChild(r)}};function c(){const e="loaders-css__square-spin",r=`
@keyframes square-spin {
  25% { transform: perspective(100px) rotateX(180deg) rotateY(0); }
  50% { transform: perspective(100px) rotateX(180deg) rotateY(180deg); }
  75% { transform: perspective(100px) rotateX(0) rotateY(180deg); }
  100% { transform: perspective(100px) rotateX(0) rotateY(0); }
}
.${e} > div {
  animation-fill-mode: both;
  width: 50px;
  height: 50px;
  background: #fff;
  animation: square-spin 3s 0s cubic-bezier(0.09, 0.57, 0.49, 0.9) infinite;
}
.app-loading-wrap {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #282c34;
  z-index: 9;
}
    `,n=document.createElement("style"),o=document.createElement("div");return n.id="app-loading-style",n.innerHTML=r,o.className="app-loading-wrap",o.innerHTML=`<div class="${e}"><div></div></div>`,{appendLoading(){a.append(document.head,n),a.append(document.body,o)},removeLoading(){a.remove(document.head,n),a.remove(document.body,o)}}}const{appendLoading:p,removeLoading:i}=c();s().then(p);window.onmessage=e=>{e.data.payload==="removeLoading"&&i()};setTimeout(i,4999);
