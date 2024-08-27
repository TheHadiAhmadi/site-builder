import {  spawn } from 'child_process'

async function test() {
	try {

           const module = await import('./teset.js')
		console.log(module.test())
	} catch(err) {

		console.log('file doesnt exist')
	}

}

// TODO: Restart project feature after adding functions.
function reload() {
	spawn('node script.js')
	process.exit()
}

setInterval(reload, 4000)