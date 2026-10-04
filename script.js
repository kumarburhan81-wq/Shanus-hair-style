const STORAGE_KEY="shanuBookings";
let selectedService={name:"Haircut",price:50}, selectedSlot=null;
const serviceButtons=document.querySelectorAll(".service");
const dateInput=document.getElementById("date");
const slotsEl=document.getElementById("slots");
const bookBtn=document.getElementById("bookBtn");
const note=document.getElementById("dateNote");
const message=document.getElementById("message");
const nameInput=document.getElementById("name");
const phoneInput=document.getElementById("phone");

function localDate(){
  const d=new Date(); return new Date(d.getTime()-d.getTimezoneOffset()*60000).toISOString().split("T")[0];
}
dateInput.min=localDate(); dateInput.value=localDate();

serviceButtons.forEach(btn=>btn.addEventListener("click",()=>{
  serviceButtons.forEach(x=>x.classList.remove("active")); btn.classList.add("active");
  selectedService={name:btn.dataset.service,price:Number(btn.dataset.price)};
  selectedSlot=null; renderSlots();
}));

function times(){
  const out=[];
  for(let h=9;h<17;h++){
    for(let m=0;m<60;m+=30){
      const hour=(h%12||12)+":"+(m===0?"00":"30")+" "+(h<12?"AM":"PM");
      out.push({label:hour,value:String(h).padStart(2,"0")+":"+String(m).padStart(2,"0")});
    }
  }
  return out;
}
function getBookings(){return JSON.parse(localStorage.getItem(STORAGE_KEY)||"[]");}
function renderSlots(){
  const date=dateInput.value;
  const day=new Date(date+"T12:00:00").getDay();
  slotsEl.innerHTML="";
  selectedSlot=null; bookBtn.disabled=true;
  if(!date){note.textContent="Select a date.";return;}
  if(day===2){note.textContent="Tuesday is closed. Please choose another day."; return;}
  note.textContent="30-minute slots · 9:00 AM to 5:00 PM";
  const booked=getBookings().filter(x=>x.date===date).map(x=>x.time);
  times().forEach(t=>{
    const b=booked.includes(t.value);
    const btn=document.createElement("button");
    btn.className="slot "+(b?"booked":"available");
    btn.textContent=t.label+(b?" · Booked":"");
    btn.disabled=b;
    if(!b) btn.onclick=()=>{document.querySelectorAll(".slot").forEach(x=>x.classList.remove("selected"));btn.classList.add("selected");selectedSlot=t.value;bookBtn.disabled=false;};
    slotsEl.appendChild(btn);
  });
}
dateInput.addEventListener("change",renderSlots);

bookBtn.addEventListener("click",()=>{
  const name=nameInput.value.trim(), phone=phoneInput.value.trim();
  message.className="message";
  if(!name||!phone||!selectedSlot){message.textContent="Please complete all details.";message.classList.add("error");return;}
  const date=dateInput.value;
  if(new Date(date+"T12:00:00").getDay()===2){message.textContent="Tuesday is closed.";message.classList.add("error");return;}
  const all=getBookings();
  if(all.some(x=>x.date===date&&x.time===selectedSlot)){message.textContent="Sorry, this slot is already booked.";message.classList.add("error");renderSlots();return;}
  all.push({id:Date.now(),date,time:selectedSlot,service:selectedService.name,price:selectedService.price,name,phone});
  localStorage.setItem(STORAGE_KEY,JSON.stringify(all));
  message.innerHTML="<strong>Booking Confirmed!</strong><br>"+name+" · "+selectedService.name+" · "+formatTime(selectedSlot);
  message.classList.add("success");
  renderSlots(); nameInput.value=""; phoneInput.value="";
});
function formatTime(v){const [h,m]=v.split(":").map(Number);return `${h%12||12}:${String(m).padStart(2,"0")} ${h<12?"AM":"PM"}`;}
renderSlots();