function addel(parent, tag, id, clickFunc, inner) {
  let elem = document.createElement(tag);
  elem.id = id;
  elem.onclick = clickFunc;
  elem.innerHTML = inner;
  document.getElementById(parent).appendChild(elem);
}

function addinp(parent, id, name, type, placeholder) {
  let elem = document.createElement('input');
  elem.id = id;
  elem.name = name;
  elem.type = type;
  elem.placeholder = placeholder;
  document.getElementById(parent).appendChild(elem);
}

function uuid() {
  const s4 = function() {
    return Math.floor(Math.random() * 0x10000).toString(16);
  };
  return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
}

export {
  addel,
  addinp,
  uuid,
};
