const toCBase64 = (source) => {
	const bin = source instanceof Uint8Array ? source : new Uint8Array(source.buffer || source)
	const binstr = Array.from(bin, x => String.fromCharCode(x)).join("")
	const base64 = btoa(binstr)
	return base64.replaceAll("+", "_").replaceAll("/", "-").replaceAll("=", "")
}

const fromCBase64 = (source) => {
	const base64 = source.replaceAll("_", "+").replaceAll("-", "/")
	const binstr = atob(base64)
	return Uint8Array.from(binstr, x => x.charCodeAt())
}

const createKey = async (password) => {
	const bin = new TextEncoder().encode(password)
	const hash = await crypto.subtle.digest("SHA-256", bin)
	const key = await crypto.subtle.importKey("raw", hash, "AES-CBC", false, ["encrypt", "decrypt"])
	return key
}

const encrypt = async (data, password) => {
	const key = await createKey(password)
	const iv = crypto.getRandomValues(new Uint8Array(16))

	const encrypted = await crypto.subtle.encrypt({ name: "AES-CBC", iv }, key, data)
	return toCBase64(iv) + "," + toCBase64(encrypted)
}

const decrypt = async (encrypted, password) => {
	const key = await createKey(password)
	const [iv, data] = encrypted.split(",").map(fromCBase64)

	const decrypted = await crypto.subtle.decrypt({ name: "AES-CBC", iv }, key, data)
	return decrypted
}

export { encrypt, decrypt }
