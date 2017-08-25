import { v, w } from '@dojo/widget-core/d';
import { DNode } from '@dojo/widget-core/interfaces';
import { WidgetBase } from '@dojo/widget-core/WidgetBase';
import { theme, ThemeableMixin } from '@dojo/widget-core/mixins/Themeable';

import * as css from './styles/App.m.css';

interface DotProperties {
	x: number;
	y: number;
	size: number;
	text: string | null;
}

const targetSize = 25;

@theme(css)
class Dot extends ThemeableMixin(WidgetBase)<DotProperties> {

	private _hover = false;

	private _enter() {
		this._hover = true;
		this.invalidate();
	}

	private _leave() {
		this._hover = false;
		this.invalidate();
	}

	render() {
		const { x, y, size, text } = this.properties;
		const s = size * 1.3;
		const styles = {
			width: `${s}px`,
			height: `${s}px`,
			left: `${x}px`,
			top: `${y}px`,
			borderRadius: `${(s / 2)}px`,
			lineHeight: `${s}px`
		};

		return v('div', {
			styles,
			classes: this.classes(css.dot, this._hover ? css.hover : null),
			onmouseenter: this._enter,
			onmouseleave: this._leave
		}, [ this._hover ? `*${text}*` : text ]);
	}
}

interface SierpinskiTriangleProperties {
	x: number;
	y: number;
	s: number;
}

class SierpinskiTriangle extends WidgetBase<SierpinskiTriangleProperties, string> {
	render() {
		let { s, y, x } = this.properties;

		if (s <= targetSize) {
			return w(Dot, {
				x: x - (targetSize / 2),
				y: y - (targetSize / 2),
				size: targetSize,
				text: this.children[0]
			});
		}

		const newSize = s / 2;
		const slowDown = true;
		if (slowDown) {
			const future = performance.now() + 0.8;
			while (performance.now() < future) {}
		}

		s /= 2;

		return v('div', {},  [
			w(SierpinskiTriangle, { key: '1', x, y: y - (s / 2), s }, this.children),
			w(SierpinskiTriangle, { key: '2', x: x - s, y: y + (s / 2), s }, this.children),
			w(SierpinskiTriangle, { key: '3', x: x + s, y: y + (s / 2), s }, this.children)
		]);

	}
}

interface ExampleApplicationProperties {
	elapsed: number;
}

@theme(css)
export class ExampleApplication extends ThemeableMixin(WidgetBase)<ExampleApplicationProperties> {
	private _seconds = 0;
	private _interval: any;

	private tick = () => {
		this._seconds = (this._seconds % 10) + 1;
		this.invalidate();
	}

	onElementCreated() {
		this._interval = setInterval(this.tick, 1000);
		this.own({
			destroy: () => {
				clearInterval(this._interval);
			}
		});
	}

	render() {
		const { _seconds, properties: { elapsed } } = this;
		const t = (elapsed / 1000) % 10;
		const scale = 1 + (t > 5 ? 10 - t : t) / 10;
		const transform = 'scaleX(' + (scale / 2.1) + ') scaleY(0.7) translateZ(0.1px)';

		return v('div', { styles: { transform }, classes: this.classes(css.container) }, [
			v('div', {}, [
				w(SierpinskiTriangle, { x: 0, y: 0, s: 1000}, [ `${_seconds}` ])
			])
		]);
	}
}

