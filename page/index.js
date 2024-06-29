import { encrypt, decrypt } from "./crypto.js"

let result = null

const safePrint = (text) => {
	if (text.length >= 1_000_000) {
		el_result.value = "«文字数が多すぎるので表示を省略します»"
	} else {
		el_result.value = text
	}
}

const convert = async (source) => {
	const password = el_password.value
	const mode = el_encrypt.checked ? "encrypt" : "decrypt"

	if (mode === "encrypt") {
		const data = typeof source === "string" ? new TextEncoder().encode(source) : source
		result = await encrypt(data, password)
		safePrint(result)
	} else {
		try {
			const data = typeof source === "string" ? source : new TextDecoder().decode(source)
			result = await decrypt(data, password)
			safePrint(new TextDecoder().decode(result))	
		} catch (err) {
			console.error(err)
			result = null
			safePrint("«復号に失敗しました»")
		}
	}
}

const handlers = {
	onOK: async () => {
		convert(el_data.value)
	},
	onDrop: async (eve) => {
		eve.preventDefault()
		el_dragover.hidden = true
		const file = eve.dataTransfer.files[0]
		if (!file) return
		el_data.value = "«FILE»"
		if (file.size > 20_000_000) {
			result = null
			safePrint("«ファイルサイズが大きすぎます»")
			return
		}
		convert(await file.arrayBuffer())
	},
	onSave: async () => {
		if (!result) {
			alert("データがありません")
			return
		}
		const handle = await showSaveFilePicker()
		const writable = await handle.createWritable()
		await writable.write(result)
		await writable.close()
	},
	onDragEnter: () => {
		el_dragover.hidden = false
	},
	onDragLeave: () => {
		el_dragover.hidden = true
	}
}

el_ok.onclick = handlers.onOK
el_save.onclick = handlers.onSave
window.ondragenter = handlers.onDragEnter
el_dragover.ondragleave = handlers.onDragLeave
window.ondragover = eve => eve.preventDefault()
window.ondrop = handlers.onDrop
