(function ($) {
	'use strict';

	var	RCstyler = function (element, minWidth) {
		if (!(this instanceof RCstyler)) return new RCstyler(conf);

		this.minWidth = minWidth || 768;
		this.container = $('body');
		this.element = element;
		this.radioHtml = {};
		this.checkboxHtml = {};
		this.init();

		return this;
	};

	/**
	 * Initialise - attach the resize event
	 */
	RCstyler.prototype.init = function () {
		var self = this, resizeTime;
		$(window).on('resize', function () {
			if (resizeTime) clearTimeout(resizeTime);
			resizeTime = setTimeout(function () { self.onResizeEnd.call(self); }, 300);
		});

		this.onResizeEnd();
		return this;
	};

	RCstyler.prototype.onResizeEnd = function () {
		if ($(window).width() < this.minWidth) this.convertElements();
		else this.destroy();
		return this;
	};

	/**
	 * Main function to convert radio buttons to divs (styles them)
	 */
	RCstyler.prototype.convertElements = function () {
		var self = this;

		if (this.isMobile) return this;

		this.radioHtml = {};
		this.checkboxHtml = {};

		this.container.find(this.element).each(function () { self.createElement.call(self, this); });

		if (Object.keys(this.radioHtml).length) this.populate(this.radioHtml);
		if (Object.keys(this.checkboxHtml).length) this.populate(this.checkboxHtml);

		this.container
			.off('.rc-event')
			.on('click.rc-event touch.rc-event', '.rc-checkbox, .rc-radio', function () {
				self.elementClick.call(self, this);
			});
		this.isMobile = true;

		return this;
	};

	RCstyler.prototype.createElement = function (el) {
		var name = el.name,
			isRadio = el.type === 'radio' ? true : false,
			id = isRadio ? el.id : name,
			objHtml = isRadio ? this.radioHtml : this.checkboxHtml,
			cls = el.checked ? ' checked' : '',
			label, html;

		if (!objHtml[name]) objHtml[name] = [];
		if (isRadio) {
			label = id ? this.container.find('label[for="' + id + '"]').addClass('rc-hidden').html() : 'No Label Defined';
			html = '<div class="' + cls +' rc-radio" data-id="' + id + '">' + label + '</div>';
		}
		else {
			label = $(el).siblings('label').addClass('rc-hidden').text();
			html = '<div class="rc-checkbox ' + cls + '" data-id="' + id + '"><div class="rc-checkbox-mark"><span>&#10004</span></div><div class="rc-checkbox-label">' + label + '</div></div>';
		}

		objHtml[name].push(html);

		return this;
	};

	/**
	 * Hide native elements and populate the mobile versions
	 * @param   {object}  objHtml    Object with radio or checkbox arrays
	 */
	RCstyler.prototype.populate = function (objHtml) {
		var self = this, name, isRadio = (objHtml === this.radioHtml);

		for (name in objHtml) {
			if (isRadio) {
				this.container
					.find('input[name="' + name + '"]')
					.addClass('rc-hidden')
					.last()
					.after('<div class="rc-container rc-' + name + '">' + objHtml[name].join('') + '</div>');
			}
			else {
				this.container
					.find('input[name="' + name + '"]')
					.addClass('rc-hidden')
					.siblings('label')
					.after('<div class="rc-container rc-' + name + '">' + objHtml[name].join('') + '</div>');
			}
		}
		return this;
	};

	RCstyler.prototype.elementClick = function (el) {

		var elem = $(el),
			id = elem.data('id'),
			isRadio = elem.hasClass('rc-radio'),
			input = isRadio ? this.container.find('input#' + id)[0] : this.container.find('input[name="' + id + '"]')[0],
			wasChecked = input.checked;

		if (isRadio) {
			if (id) input.checked = true;
			elem.addClass('checked').siblings('.rc-radio').removeClass('checked');
		}
		else {
			input.checked = !wasChecked;
			elem.toggleClass('checked', !wasChecked);
		}

		return this;
	};

	RCstyler.prototype.destroyElement = function (el) {
		$(el).removeClass('rc-hidden');
		this.container.find('.rc-' + el.name).remove();
		return this;
	};

	RCstyler.prototype.destroy = function () {
		this.container.find('.rc-container').remove();
		this.container.find('.rc-hidden').removeClass('rc-hidden');
		this.container.off('.rc-event');
		this.isMobile = false;
		return this;
	};

	$.fn.rcStyler = function (options) { return new RCstyler(this, options); };
})(jQuery);
