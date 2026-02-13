import {App, Editor, MarkdownView, Modal, Notice, Plugin} from 'obsidian';
import {DEFAULT_SETTINGS, MyPluginSettings, SampleSettingTab} from "./settings";


// Remember to rename these classes and interfaces!

export default class MyPlugin extends Plugin {
	settings: MyPluginSettings;

		pandaEl: HTMLDivElement; 
		pandaImg: HTMLImageElement; 
		counterEl: HTMLDivElement;

		typingTimeout: number | null = null;
		frameIndex = 0;
		frames: string[] = [
			"panda_pluck_2.png",
			"panda_pluck_3.png"
		];
		typingCount = 0;

	async onload() {
		await this.loadSettings();

		console.log("Panda plugin loaded!");

		this.typingCount = this.settings.typingCount ?? 0;
		
		// create cute panda
		this.app.workspace.onLayoutReady(() => {
			this.createPanda();
		});

		console.log("Panda element:", this.pandaEl);


		//detect typing
		this.registerEvent(
			this.app.workspace.on("editor-change", () => {
				this.onUserTyping();
			})
		);
	}

	onunload() {
		if (this.pandaEl) {
			this.pandaEl.remove();
		}
	}

	createPanda() {
		this.pandaEl = createDiv({cls: "panda-container"});
		this.pandaImg = this.pandaEl.createEl("img", {
			attr: {src: this.getAssetPath("panda_idle.png")},
			cls: "panda-img"
		})

		this.counterEl = this.pandaEl.createEl("div", {
			cls: "panda-counter",
			text: this.typingCount.toString()
		});

		document.body.appendChild(this.pandaEl);
	}

	onUserTyping() {
		this.nextFrame();

		// count typing
		this.typingCount++;
		this.counterEl.textContent = this.typingCount.toString();

		// save typing count
		this.settings.typingCount = this.typingCount;
		this.saveSettings();


		if (this.typingTimeout) {
			clearTimeout(this.typingTimeout);
		}
		//return to idle after some time not typing
		this.typingTimeout = window.setTimeout(() => {
			this.frameIndex = 0;
			this.pandaImg.src = this.getAssetPath("panda_idle.png");
		}, 200);
	}

	nextFrame() {
		this.frameIndex = (this.frameIndex + 1) % this.frames.length;
		this.pandaImg.src = this.getAssetPath(this.frames[this.frameIndex]!);
	}


	getAssetPath(file: string): string {
		return this.app.vault.adapter.getResourcePath(
			`${this.manifest.dir}/assets/${file}`
		)
	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData() as Partial<MyPluginSettings>);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

class SampleModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		let {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}
