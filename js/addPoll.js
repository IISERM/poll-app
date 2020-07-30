function resetoptions() {
    const options = document.getElementById("options")
    while (options.firstChild) {
        options.removeChild(options.lastChild);
    }
}
function addoption() {
    new_input = document.createElement("input")
    new_input.className = 'mv1 pa2 input-reset ba bg-transparent'
    new_input.type = 'text'
    new_input.name = 'options[]'
    new_input.placeholder = 'Option'
    new_input.required = true
    document.getElementById("options").appendChild(new_input)
}
function opendialog() {
    dia = document.getElementById('addQDialog')
    dia.classList.remove('dn')
    dia.classList.add('flex')
}
function closedialog() {
    dia = document.getElementById('addQDialog')
    dia.classList.remove('flex')
    dia.classList.add('dn')
}
