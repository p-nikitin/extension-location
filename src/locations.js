export class Locations {
    constructor(rootId, params = {}) {
        this.rootId = rootId;
        this.popupUrl = params.popupUrl || '';

        this.timer = null;
        this.root = document.getElementById(rootId);
        if (this.root) {
            this.init();
        }
    }

    init() {
        this.title = this.root.querySelector('.js-header-location-title');
        this.label = this.root.querySelector('.js-header-location-label');

        if (this.title) {
            this.title.addEventListener('click', this.titleClickHandler.bind(this));
        }

        document.addEventListener('click', e => {
            const el = e.target;
            if (this.wrapper && !el.closest('.header__location')) {
                this.wrapper.style.display = 'none';
            }
        });
    }

    initPopup() {
        this.closeButton = this.wrapper.querySelector('.js-header-location-close');
        this.input = this.wrapper.querySelector('.js-header-location-input');
        this.defaultList = this.wrapper.querySelector('.js-header-location-default-list');
        this.searchList = this.wrapper.querySelector('.js-header-location-search-list');

        if (this.closeButton) {
            this.closeButton.addEventListener('click', () => {
                this.wrapper.style.display = 'none';
            })
        }
        if (this.input) {
            this.input.addEventListener('input', this.inputHandler.bind(this));
        }
    }

    inputHandler() {
        if (this.input.value.length < 1) {
            this.defaultList.style.display = 'block';
            this.searchList.style.display = 'none';
        } else if (this.input.value.length > 2) {
            this.defaultList.style.display = 'none';
            this.searchList.style.display = 'block';
            this.search();
        }
    }

    search() {
        if (this.timer)
            clearTimeout(this.timer);

        this.timer = setTimeout(() => {
            BX.ajax.runComponentAction('izifir:locations', 'search', {
                mode: 'ajax',
                data: {q: this.input.value}
            }).then((response) => {
                this.searchList.innerHTML = '';
                if (response.data) {
                    for (let k in response.data) {
                        this.searchList.appendChild(this.getResultListItem(response.data[k]));
                    }
                }
            });
        }, 300);
    }

    getResultListItem(item) {
        const li = document.createElement('li');
        li.classList.add('modal-location-list__item');

        const link = document.createElement('a');
        link.classList.add('modal-location-list__link');
        link.href = '?city=' + item.ID;

        const span = document.createElement('span');
        span.innerText = item.NAME;

        link.append(span);
        li.appendChild(link);

        return li;
    }

    titleClickHandler() {
        if (!this.wrapper) {
            this.createWrapper();
            this.title.insertAdjacentElement('afterend', this.wrapper);
            this.loadPopup();
        }
        this.toggleWrapper();
    }

    loadPopup() {
        BX.ajax({
            url: this.popupUrl,
            method: 'GET',
            onsuccess: (response) => {
                this.wrapper.innerHTML = response;
                this.initPopup();
            }
        });
    }

    createWrapper() {
        this.wrapper = document.createElement('div');
        this.wrapper.classList.add('modal-location');
        this.wrapper.innerText = 'Загрузка...'
    }

    toggleWrapper() {
        if (this.wrapper.style.display === 'block')
            this.wrapper.style.display = 'none';
        else
            this.wrapper.style.display = 'block';
    }
}
