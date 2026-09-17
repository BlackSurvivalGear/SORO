import { getApp } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import { getAuth } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js';
import { getFirestore, collection, addDoc, query, orderBy, limit, onSnapshot, serverTimestamp } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-storage.js';

const app=getApp(),auth=getAuth(app),db=getFirestore(app),storage=getStorage(app);
const input=document.querySelector('#image-input'),pick=document.querySelector('#pick-image'),preview=document.querySelector('#image-preview'),previewImg=document.querySelector('#image-preview-img'),remove=document.querySelector('#remove-image'),send=document.querySelector('#send-image'),status=document.querySelector('#room-message'),messageList=document.querySelector('#message-list'),viewer=document.querySelector('#image-viewer'),viewerImg=document.querySelector('#image-viewer-img'),closeViewer=document.querySelector('#close-image-viewer');
const allowed=new Set(['image/jpeg','image/png','image/webp']);
const MAX=5*1024*1024;
let selected=null,objectUrl=null,imageMessages=new Map();

function resetSelection(){selected=null;if(objectUrl)URL.revokeObjectURL(objectUrl);objectUrl=null;input.value='';preview.classList.add('hidden');previewImg.removeAttribute('src');send.disabled=true}
function showStatus(text){status.textContent=text}
function openViewer(url){viewerImg.src=url;viewer.showModal()}
function decorateImages(){document.querySelectorAll('.chat-message[data-message-id]').forEach(card=>{const data=imageMessages.get(card.dataset.messageId);if(!data?.imageUrl)return;if(card.querySelector('.message-image'))return;const body=card.querySelector('p:not(.reply-preview p)');if(body&&!body.textContent.trim())body.remove();const img=document.createElement('img');img.className='message-image';img.src=data.imageUrl;img.alt='Crew image';img.loading='lazy';img.addEventListener('click',()=>openViewer(data.imageUrl));const actions=card.querySelector('.message-actions');if(actions)actions.remove();card.append(img)})}

pick.addEventListener('click',()=>input.click());
input.addEventListener('change',()=>{const file=input.files?.[0];if(!file)return resetSelection();if(!allowed.has(file.type)){showStatus('Choose a JPG, PNG or WebP image.');return resetSelection()}if(file.size>MAX){showStatus('Image must be 5 MB or smaller.');return resetSelection()}selected=file;objectUrl=URL.createObjectURL(file);previewImg.src=objectUrl;preview.classList.remove('hidden');send.disabled=false;showStatus('')});
remove.addEventListener('click',resetSelection);
closeViewer.addEventListener('click',()=>viewer.close());
viewer.addEventListener('click',e=>{if(e.target===viewer)viewer.close()});
send.addEventListener('click',async()=>{const user=auth.currentUser;if(!selected||!user)return;send.disabled=true;pick.disabled=true;showStatus('Uploading image…');const ext=selected.type==='image/png'?'png':selected.type==='image/webp'?'webp':'jpg';const storagePath=`crew-images/${user.uid}/${crypto.randomUUID()}.${ext}`;const storageRef=ref(storage,storagePath);let uploaded=false;try{await uploadBytes(storageRef,selected,{contentType:selected.type});uploaded=true;const imageUrl=await getDownloadURL(storageRef);await addDoc(collection(db,'messages'),{uid:user.uid,displayName:user.displayName||'Crew member',imageUrl,imagePath:storagePath,imageType:selected.type,imageSize:selected.size,createdAt:serverTimestamp()});resetSelection();showStatus('')}catch(err){console.error(err);if(uploaded){try{await deleteObject(storageRef)}catch(cleanupErr){console.error('Image cleanup failed',cleanupErr)}}showStatus(`Image not sent. ${err.code||''}`)}finally{pick.disabled=false;if(selected)send.disabled=false}});

const q=query(collection(db,'messages'),orderBy('createdAt','asc'),limit(200));
onSnapshot(q,snapshot=>{imageMessages=new Map(snapshot.docs.filter(d=>d.data().imageUrl).map(d=>[d.id,d.data()]));decorateImages();setTimeout(decorateImages,0)},err=>console.error('Image listener failed',err));
const observer=new MutationObserver(decorateImages);observer.observe(messageList,{childList:true,subtree:true});
