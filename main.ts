import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting } from 'obsidian';
import fetchRandomImage from "./services/unsplash"

// Remember to rename these classes and interfaces!

interface PluginSettings {
	unsplashAccessKey: string;
	query: string;
}

const DEFAULT_SETTINGS: PluginSettings = {
	unsplashAccessKey: '',
	query: ''
}

export default class RandomPicPlugin extends Plugin {
	settings: PluginSettings;

	async onload() {
		await this.loadSettings();

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new RandomPicSettingTab(this.app, this));

		// If the plugin hooks up any global DOM events (on parts of the app that doesn't belong to this plugin)
		// Using this function will automatically remove the event listener when this plugin is disabled.
		this.registerDomEvent(document, 'click', (evt: MouseEvent) => {
			console.log('click', evt);
		});

		// When registering intervals, this function will automatically clear the interval when the plugin is disabled.
		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));

		this.addCommand({
			id: 'insert-random-picture',
			name: 'Insert picture',
			editorCallback: async (editor: Editor, view: MarkdownView) => {
				const unsplashAccessKey = this.settings.unsplashAccessKey;
				if (!unsplashAccessKey) {
					new Notice("Unsplash Access Key is not set!");
					return;
				}

				fetchRandomImage(unsplashAccessKey, this.settings.query)
					.then( (image) => {
						const cursor = editor.getCursor()
						editor.setLine(cursor.line, `![Photo by ${image.author.username}(${image.author.links.html})](${image.url})`)
					})
					.catch((e) => {
						console.error(e)
						new Notice("Error: " + e)
					})
			}
		})
	}

	onunload() {

	}

	async loadSettings() {
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
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
		const {contentEl} = this;
		contentEl.setText('Woah!');
	}

	onClose() {
		const {contentEl} = this;
		contentEl.empty();
	}
}

class RandomPicSettingTab extends PluginSettingTab {
	plugin: RandomPicPlugin;

	constructor(app: App, plugin: RandomPicPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const {containerEl} = this;

		containerEl.empty();
		containerEl.createEl('h2', { text: 'Unsplash Plugin Settings' });

		new Setting(containerEl)
			.setName('Unsplash Access Key')
			.setDesc('Enter your Unsplash API Access Key')
			.addText(text => text
				.setPlaceholder('Enter API Key')
				.setValue(this.plugin.settings.unsplashAccessKey)
				.onChange(async (value) => {
					this.plugin.settings.unsplashAccessKey = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Default query')
			.setDesc('Enter a default query to search for')
			.addText(text => text
				.setPlaceholder('Enter a default query')
				.setValue(this.plugin.settings.query)
				.onChange(async (value) => {
					this.plugin.settings.query = value;
					await this.plugin.saveSettings();
				}));
	}
}
