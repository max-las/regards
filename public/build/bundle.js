
(function(l, r) { if (!l || l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (self.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(self.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    let src_url_equal_anchor;
    function src_url_equal(element_src, url) {
        if (!src_url_equal_anchor) {
            src_url_equal_anchor = document.createElement('a');
        }
        src_url_equal_anchor.href = url;
        return element_src === src_url_equal_anchor.href;
    }
    function is_empty(obj) {
        return Object.keys(obj).length === 0;
    }
    function validate_store(store, name) {
        if (store != null && typeof store.subscribe !== 'function') {
            throw new Error(`'${name}' is not a store with a 'subscribe' method`);
        }
    }
    function subscribe(store, ...callbacks) {
        if (store == null) {
            return noop;
        }
        const unsub = store.subscribe(...callbacks);
        return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
    }
    function component_subscribe(component, store, callback) {
        component.$$.on_destroy.push(subscribe(store, callback));
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }
    function set_store_value(store, ret, value) {
        store.set(value);
        return ret;
    }
    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function empty() {
        return text('');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children$1(element) {
        return Array.from(element.childNodes);
    }
    function set_style(node, key, value, important) {
        if (value === null) {
            node.style.removeProperty(key);
        }
        else {
            node.style.setProperty(key, value, important ? 'important' : '');
        }
    }
    function toggle_class(element, name, toggle) {
        element.classList[toggle ? 'add' : 'remove'](name);
    }
    function custom_event(type, detail, bubbles = false) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, bubbles, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    // flush() calls callbacks in this order:
    // 1. All beforeUpdate callbacks, in order: parents before children
    // 2. All bind:this callbacks, in reverse order: children before parents.
    // 3. All afterUpdate callbacks, in order: parents before children. EXCEPT
    //    for afterUpdates called during the initial onMount, which are called in
    //    reverse order: children before parents.
    // Since callbacks might update component values, which could trigger another
    // call to flush(), the following steps guard against this:
    // 1. During beforeUpdate, any updated components will be added to the
    //    dirty_components array and will cause a reentrant call to flush(). Because
    //    the flush index is kept outside the function, the reentrant call will pick
    //    up where the earlier call left off and go through all dirty components. The
    //    current_component value is saved and restored so that the reentrant call will
    //    not interfere with the "parent" flush() call.
    // 2. bind:this callbacks cannot trigger new flush() calls.
    // 3. During afterUpdate, any updated components will NOT have their afterUpdate
    //    callback called a second time; the seen_callbacks set, outside the flush()
    //    function, guarantees this behavior.
    const seen_callbacks = new Set();
    let flushidx = 0; // Do *not* move this inside the flush() function
    function flush() {
        const saved_component = current_component;
        do {
            // first, call beforeUpdate functions
            // and update components
            while (flushidx < dirty_components.length) {
                const component = dirty_components[flushidx];
                flushidx++;
                set_current_component(component);
                update(component.$$);
            }
            set_current_component(null);
            dirty_components.length = 0;
            flushidx = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        seen_callbacks.clear();
        set_current_component(saved_component);
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function group_outros() {
        outros = {
            r: 0,
            c: [],
            p: outros // parent group
        };
    }
    function check_outros() {
        if (!outros.r) {
            run_all(outros.c);
        }
        outros = outros.p;
    }
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }

    const globals = (typeof window !== 'undefined'
        ? window
        : typeof globalThis !== 'undefined'
            ? globalThis
            : global);
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor, customElement) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        if (!customElement) {
            // onMount happens before the initial afterUpdate
            add_render_callback(() => {
                const new_on_destroy = on_mount.map(run).filter(is_function);
                if (on_destroy) {
                    on_destroy.push(...new_on_destroy);
                }
                else {
                    // Edge case - component was destroyed immediately,
                    // most likely as a result of a binding initialising
                    run_all(new_on_destroy);
                }
                component.$$.on_mount = [];
            });
        }
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, append_styles, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            on_disconnect: [],
            before_update: [],
            after_update: [],
            context: new Map(options.context || (parent_component ? parent_component.$$.context : [])),
            // everything else
            callbacks: blank_object(),
            dirty,
            skip_bound: false,
            root: options.target || parent_component.$$.root
        };
        append_styles && append_styles($$.root);
        let ready = false;
        $$.ctx = instance
            ? instance(component, options.props || {}, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if (!$$.skip_bound && $$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children$1(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor, options.customElement);
            flush();
        }
        set_current_component(parent_component);
    }
    /**
     * Base class for Svelte components. Used when dev=false.
     */
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set($$props) {
            if (this.$$set && !is_empty($$props)) {
                this.$$.skip_bound = true;
                this.$$set($$props);
                this.$$.skip_bound = false;
            }
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.46.4' }, detail), true));
    }
    function append_dev(target, node) {
        dispatch_dev('SvelteDOMInsert', { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev('SvelteDOMInsert', { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev('SvelteDOMRemove', { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ['capture'] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev('SvelteDOMAddEventListener', { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev('SvelteDOMRemoveEventListener', { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev('SvelteDOMRemoveAttribute', { node, attribute });
        else
            dispatch_dev('SvelteDOMSetAttribute', { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.wholeText === data)
            return;
        dispatch_dev('SvelteDOMSetData', { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    /**
     * Base class for Svelte components with some minor dev-enhancements. Used when dev=true.
     */
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error("'target' is a required option");
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn('Component was already destroyed'); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    var dialogs = [{character:"",text:"Un beau matin de printemps s’annonce à Bordeaux. Au musée des beaux-arts, trois frères et sœurs visitent l’aile sud.",picture:"museum_inside"},{character:"",text:"Voici Léo, André et Camille…",picture:"children"},{character:"",text:"Alors qu'ils déambulent dans le musée, un tableau retient leur attention...",picture:"children"},{character:"",text:" Face à eux, accroché en hauteur, un tableau d’une taille imposante se dresse...",picture:"framed"},{character:"",text:"Un sentiment très particulier les parcourt alors...",picture:"children"},{character:"",text:"À ce moment précis, une chose est sûre, cette peinture à su retenir leurs regards...",picture:"children"},{character:"Leo",text:"Leo : Il est drôle celui-là, on dirait qu’il se passe plein de choses à la fois.",picture:"children"},{character:"Camille",text:"Camille : Ils se regardent tous comme s'ils discutaient entre eux.",picture:"children"},{character:"Leo",text:"Leo : L’homme avec une grande barbe grise semble cacher quelque chose...",picture:"children"},{character:"Leo",text:"Leo : Moi, j’ai l'impression que…",picture:"framed"},{character:"",text:"",picture:"christ",click:"Barbegrisebandeau"},{character:"Barbegrisebandeau",text:"« Je sais que c’est vous ! Je vous ai vu ! »",picture:"christ",zoom:"Barbegrisebandeau"},{character:"Hommeorange",text:"« Comment osez-vous ?! »",picture:"christ",zoom:"Hommeorange"},{character:"Jesus",text:"« Mes frères, celui qui a volé doit se dénoncer ! »",picture:"christ"},{character:"Jesus",text:"« Le bien de cette dame doit lui être rendu ! »",picture:"christ"},{character:"",text:"",picture:"christ",click:"Hommeorange"},{character:"Hommeorange",text:"« Très bien, j’avoue, je l’ai vu lui voler sa bourse ! C’est lui le fourbe ! »",picture:"christ",zoom:"Hommeorange"},{character:"Barbegrisebandeau",text:"« Comment osez-vous ? On peut deviner le voleur d’un regard ! »",picture:"christ",zoom:"Barbegrisebandeau"},{character:"Jesus",text:"« Mais comment savez-vous que c’est une bourse qui a été volée ? »",picture:"christ",zoom:"Jesus"},{character:"Hommeorange",text:"« Euuuh et bien… »",picture:"christ",zoom:"Barbegrisebandeau"},{character:"",text:"",picture:"christ",click:"MaindelHommeOrange"},{character:"",text:"",picture:"christ",zoom:"MaindelHommeOrange",click:"MaindelHommeOrangeZoom"},{character:"Jesus",text:"« Ah ah ! Pris la main dans le sac ! »",picture:"christ"},{character:"",text:"",picture:"christ",click:"FemmeDenudée"},{character:"FemmeDenudée",text:"« Oooh merci ! Je suis heureuse que vous ayez retrouvé le voleur ! »",picture:"christ",zoom:"FemmeDenudée"},{character:"André",text:"André : Ppfffffft n’importe quoi ton histoire !",picture:"children"},{character:"André",text:"André : Regarde plutôt l’homme au fond. Il paraît louche.",picture:"children"},{character:"André",text:"André : Pour moi l’histoire de ce tableau, c’est clairement…",picture:"framed"},{character:"",text:"",picture:"christ",click:"HommeDuFond"},{character:"HommeDuFond",text:"« Cet homme avec une arme prépare un mauvais coup. »",picture:"christ",zoom:"HommeDuFond"},{character:"",text:"« Je pense qu’il s'apprête à tuer ! »",picture:"christ",zoom:"HommeDuFond"},{character:"",text:"« La commère du village derrière en saura forcément plus. »",picture:"christ",zoom:"HommeDuFond"},{character:"",text:"",picture:"christ",click:"Dameauxperles"},{character:"Dameauxperles",text:"« Oui, je sais tout. C’est sûr ! Il veut tuer la femme, regarde le, avec son air coupable. »",picture:"christ",zoom:"Dameauxperles"},{character:"Dameauxperles",text:"« Il faut prévenir les gardes. »",picture:"christ",zoom:"Dameauxperles"},{character:"",text:"",picture:"christ",click:"Garde"},{character:"Garde",text:"« Ne vous inquiétez pas madame, je ne laisserai personne mourir ! »",picture:"christ",zoom:"Garde"},{character:"Garde",text:"« Halte-là ! Vous ne ferez de mal à personne aujourd'hui. »",picture:"christ"},{character:"Femmevoilerose",text:"« Lâchez-moi garde ! Je suis innocent ! Cette femme est une voleuse. Elle ne m’a jamais remboursée ! »",picture:"christ",zoom:"Femmevoilerose"},{character:"Garde",text:"« Silence malotru ! Je vais te jeter au cachot ! Il ne pourra plus vous faire de mal madame. »",picture:"christ",zoom:"Garde"},{character:"FemmeDenudée",text:"« Me voilà soulagée ! Merci garde ! »",picture:"christ",zoom:"FemmeDenudéeTop"},{character:"André",text:"André : Et heureusement, elle est sauvée et n’a plus de dettes.",picture:"children"},{character:"Camille",text:"Camille : Mais non, gros bêta, ils sont en train de débattre pour construire un village.",picture:"children"},{character:"Camille",text:"Camille : Donc ce qu’il se passe réellement…",picture:"framed"},{character:"",text:"",picture:"christ",click:"Hommeauchapeau"},{character:"Hommeauchapeau",text:"« Ecoutez-moi ! Nous devons nous décider avant ce soir ! »",picture:"christ",zoom:"Hommeauchapeau"},{character:"FemmeDenudée",text:"« Oui, grand chef du village, si nous ne trouvons pas où dormir, cela pourrait être dangereux ! »",picture:"christ",zoom:"FemmeDenudée"},{character:"FemmeDenudée",text:"« Quelqu’un à une idée ? »",picture:"christ",zoom:"Hommeauchapeau"},{character:"",text:"",picture:"christ",click:"Barbegriseprofil"},{character:"Barbegriseprofil",text:"« Si on construit ma grange, elle sera assez grande pour que nous puissions tous dormir dedans, ce sera rapide ! »",picture:"christ",zoom:"Barbegriseprofil"},{character:"",text:"",picture:"christ",click:"GardeCenter"},{character:"Garde",text:"« N’oubliez pas le prisonnier, il nous faut une prison. »",picture:"christ",zoom:"GardeCenter"},{character:"",text:"",picture:"christ",click:"HommeLouche"},{character:"HommeLouche",text:"« Excusez-moi, mais nous devons construire des chambres séparées. »",picture:"christ",zoom:"HommeLouche"},{character:"FemmeLouche",text:"« Et je ne supporte pas la paille. On mourra de froid aussi dans une prison. »",picture:"christ",zoom:"FemmeLouche"},{character:"FemmeDenudée",text:"« Il faut qu’une personne neutre tranche. »",picture:"christ",zoom:"FemmeDenudée"},{character:"HommeDuFond",text:"« Puis-je aider ? »",picture:"christ",zoom:"HommeDuFond"},{character:"Hommeauchapeau",text:"« Euh, pourquoi pas... Donnons la parole au plus reclu de notre groupe. »",picture:"christ",zoom:"Hommeauchapeau"},{character:"FemmeDenudée",text:"« Alors, que le prisonnier décide. »",picture:"christ",zoom:"FemmeDenudée"},{character:"",text:"",picture:"christ",click:"GardeCenter"},{character:"Garde",text:"« Il en est hors de question ! »",picture:"christ",zoom:"GardeCenter"},{character:"Hommeauchapeau",text:"« Il nous faut un regard extérieur, il est donc le mieux placé. »",picture:"christ",zoom:"Hommeauchapeau"},{character:"HommeDuFond",text:"« Hé bien, je pense qu'avec le temps dont nous disposons, dormir dans la paille d’une grange est la meilleure solution. »",picture:"christ",zoom:"HommeDuFond"},{character:"Camille",text:"Camille : Et ils purent dormir tous au chaud !",picture:"children"},{character:"Leo",text:"Leo : Moi, je préfère mon histoire, elle était plus simple !",picture:"children"},{character:"André",text:"André : Oui, elle était sympa mais moi elle était plus sérieuse.",picture:"children"},{character:"Camille",text:"Camille : Je préfère celle de Leo, mais avouez que la mienne est la plus intéressante.",picture:"children"},{character:"Intervenante",text:"Intervenante : Bonjour les enfants ! Ce tableau vous intrigue-t-il ?...",picture:"Intervenante"},{character:"Leo",text:"Leo : Oui, mais nous ne sommes pas d'accord sur l’histoire que le tableau raconte…",picture:"children"},{character:"Intervenante",text:"Intervenante : Je comprends, et c’est bien normal que vous ne tombiez pas d’accord… Ce tableau s’inspire de la Bible et en raconte une partie.",picture:"Intervenante"},{character:"Intervenante",text:"Intervenante : Mais ce n’est pas important, car chacune de vos interprétations à travers vos histoires est aussi intéressante que l’original.",picture:"Intervenante"}];

    var Leo={icon:"leo.png",size:"normal"};var Camille={icon:"camille.png",size:"normal"};var Barbegrisebandeau$1={icon:"Barbegrisebandeau.png",size:"small"};var Barbegriseprofil$1={icon:"barbegriseprofil.png",size:"small"};var Dameauxperles$1={icon:"Dameauxperles.png",size:"small"};var FemmeLouche$1={icon:"FemmeLouche.png",size:"small"};var Femmevoilerose$1={icon:"Femmevoilerose.png",size:"small"};var Garde$1={icon:"garde.png",size:"small"};var Hommeauchapeau$1={icon:"Hommeauchapeau.png",size:"small"};var HommeDuFond$1={icon:"HommeDuFond.png",size:"small"};var HommeLouche$1={icon:"HommeLouche.png",size:"small"};var Hommeorange$1={icon:"Hommeorange.png",size:"small"};var Hommeturbanfond={icon:"Hommeturbanfond.png",size:"small"};var Jesus$1={icon:"Jesus.png",size:"small"};var Intervenante$1={icon:"Intervenante.png",size:"small"};var characters = {Leo:Leo,"André":{icon:"andre.png",size:"normal"},Camille:Camille,Barbegrisebandeau:Barbegrisebandeau$1,Barbegriseprofil:Barbegriseprofil$1,Dameauxperles:Dameauxperles$1,"FemmeDenudée":{icon:"FemmeDenudée.png",size:"small"},FemmeLouche:FemmeLouche$1,Femmevoilerose:Femmevoilerose$1,Garde:Garde$1,Hommeauchapeau:Hommeauchapeau$1,HommeDuFond:HommeDuFond$1,HommeLouche:HommeLouche$1,Hommeorange:Hommeorange$1,Hommeturbanfond:Hommeturbanfond,Jesus:Jesus$1,Intervenante:Intervenante$1};

    const subscriber_queue = [];
    /**
     * Create a `Writable` store that allows both updating and reading by subscription.
     * @param {*=}value initial value
     * @param {StartStopNotifier=}start start and stop notifications for subscriptions
     */
    function writable(value, start = noop) {
        let stop;
        const subscribers = new Set();
        function set(new_value) {
            if (safe_not_equal(value, new_value)) {
                value = new_value;
                if (stop) { // store is ready
                    const run_queue = !subscriber_queue.length;
                    for (const subscriber of subscribers) {
                        subscriber[1]();
                        subscriber_queue.push(subscriber, value);
                    }
                    if (run_queue) {
                        for (let i = 0; i < subscriber_queue.length; i += 2) {
                            subscriber_queue[i][0](subscriber_queue[i + 1]);
                        }
                        subscriber_queue.length = 0;
                    }
                }
            }
        }
        function update(fn) {
            set(fn(value));
        }
        function subscribe(run, invalidate = noop) {
            const subscriber = [run, invalidate];
            subscribers.add(subscriber);
            if (subscribers.size === 1) {
                stop = start(set) || noop;
            }
            run(value);
            return () => {
                subscribers.delete(subscriber);
                if (subscribers.size === 0) {
                    stop();
                    stop = null;
                }
            };
        }
        return { set, update, subscribe };
    }

    const currentDialogIndex = writable(0);
    const isAdventure = writable(false);
    const isCredits = writable(false);

    /* src/components/Dialog.svelte generated by Svelte v3.46.4 */
    const file$5 = "src/components/Dialog.svelte";

    // (25:6) {#if dialogs[$currentDialogIndex].character !== ""}
    function create_if_block$2(ctx) {
    	let img;
    	let img_class_value;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", img_class_value = "" + (null_to_empty(characters[dialogs[/*$currentDialogIndex*/ ctx[0]].character].size) + " svelte-1hmu9cd"));
    			if (!src_url_equal(img.src, img_src_value = "img/characters/" + characters[dialogs[/*$currentDialogIndex*/ ctx[0]].character].icon)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$5, 25, 8, 589);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$currentDialogIndex*/ 1 && img_class_value !== (img_class_value = "" + (null_to_empty(characters[dialogs[/*$currentDialogIndex*/ ctx[0]].character].size) + " svelte-1hmu9cd"))) {
    				attr_dev(img, "class", img_class_value);
    			}

    			if (dirty & /*$currentDialogIndex*/ 1 && !src_url_equal(img.src, img_src_value = "img/characters/" + characters[dialogs[/*$currentDialogIndex*/ ctx[0]].character].icon)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(25:6) {#if dialogs[$currentDialogIndex].character !== \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$5(ctx) {
    	let div4;
    	let div3;
    	let div0;
    	let t0;
    	let p0;
    	let t1_value = dialogs[/*$currentDialogIndex*/ ctx[0]].text + "";
    	let t1;
    	let t2;
    	let div2;
    	let p1;
    	let t4;
    	let div1;
    	let t5;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;
    	let if_block = dialogs[/*$currentDialogIndex*/ ctx[0]].character !== "" && create_if_block$2(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			p0 = element("p");
    			t1 = text(t1_value);
    			t2 = space();
    			div2 = element("div");
    			p1 = element("p");
    			p1.textContent = "SUIVANT";
    			t4 = space();
    			div1 = element("div");
    			t5 = space();
    			img = element("img");
    			attr_dev(div0, "class", "character svelte-1hmu9cd");
    			add_location(div0, file$5, 23, 4, 499);
    			attr_dev(p0, "class", "font-montserrat text svelte-1hmu9cd");
    			add_location(p0, file$5, 28, 4, 774);
    			attr_dev(p1, "class", "font-cinzel nextButton svelte-1hmu9cd");
    			add_location(p1, file$5, 30, 6, 890);
    			attr_dev(div1, "class", "underline svelte-1hmu9cd");
    			add_location(div1, file$5, 31, 6, 942);
    			set_style(div2, "width", "fit-content");
    			add_location(div2, file$5, 29, 4, 850);
    			attr_dev(div3, "class", "content svelte-1hmu9cd");
    			add_location(div3, file$5, 22, 2, 473);
    			attr_dev(img, "class", "decoration svelte-1hmu9cd");
    			if (!src_url_equal(img.src, img_src_value = "img/deco/cadre_decors.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$5, 34, 2, 994);
    			attr_dev(div4, "class", "dialog svelte-1hmu9cd");
    			add_location(div4, file$5, 21, 0, 434);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			if (if_block) if_block.m(div0, null);
    			append_dev(div3, t0);
    			append_dev(div3, p0);
    			append_dev(p0, t1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, p1);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div4, t5);
    			append_dev(div4, img);

    			if (!mounted) {
    				dispose = listen_dev(div4, "click", /*next*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dialogs[/*$currentDialogIndex*/ ctx[0]].character !== "") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$2(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*$currentDialogIndex*/ 1 && t1_value !== (t1_value = dialogs[/*$currentDialogIndex*/ ctx[0]].text + "")) set_data_dev(t1, t1_value);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			if (if_block) if_block.d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props, $$invalidate) {
    	let $currentDialogIndex;
    	validate_store(currentDialogIndex, 'currentDialogIndex');
    	component_subscribe($$self, currentDialogIndex, $$value => $$invalidate(0, $currentDialogIndex = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Dialog', slots, []);
    	let { first } = $$props;
    	set_store_value(currentDialogIndex, $currentDialogIndex = first, $currentDialogIndex);
    	let canContinue = true;

    	function next() {
    		if (canContinue) {
    			set_store_value(currentDialogIndex, $currentDialogIndex += 1, $currentDialogIndex);
    			canContinue = false;

    			setTimeout(
    				() => {
    					canContinue = true;
    				},
    				1100
    			);
    		}
    	}

    	const writable_props = ['first'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Dialog> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('first' in $$props) $$invalidate(2, first = $$props.first);
    	};

    	$$self.$capture_state = () => ({
    		dialogs,
    		characters,
    		currentDialogIndex,
    		first,
    		canContinue,
    		next,
    		$currentDialogIndex
    	});

    	$$self.$inject_state = $$props => {
    		if ('first' in $$props) $$invalidate(2, first = $$props.first);
    		if ('canContinue' in $$props) canContinue = $$props.canContinue;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [$currentDialogIndex, next, first];
    }

    class Dialog extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, { first: 2 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dialog",
    			options,
    			id: create_fragment$5.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*first*/ ctx[2] === undefined && !('first' in props)) {
    			console.warn("<Dialog> was created without expected prop 'first'");
    		}
    	}

    	get first() {
    		throw new Error("<Dialog>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set first(value) {
    		throw new Error("<Dialog>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    var museum_inside="museum_inside.jpg";var children="children.jpg";var framed="framed.png";var christ="christ.png";var Intervenante="Intervenante.png";var pictures = {museum_inside:museum_inside,children:children,framed:framed,christ:christ,Intervenante:Intervenante};

    var Barbegrisebandeau={x:23.59,y:55,w:12.32,h:31.25,transform:"scale(3) translate(21vw, 10vw)"};var Hommeorange={x:10.59,y:45,w:18.32,h:35.25,transform:"scale(3) translate(30vw, 6vw)"};var Jesus={transform:"scale(3) translate(6vw, 10vw)"};var MaindelHommeOrange={x:24.25,y:27,w:12.32,h:23.25,transform:"scale(3) translate(20vw, -5vw)"};var MaindelHommeOrangeZoom={x:39.25,y:23,w:25.32,h:34.25};var HommeDuFond={x:63.25,y:77,w:12.32,h:23.25,transform:"scale(5) translate(-19vw, 35vh)"};var HommeDuFondCenter={transform:"scale(5) translate(-19vw, 35vh)"};var Dameauxperles={x:58,y:65,w:11.32,h:23.25,transform:"scale(4) translate(-14vw, 23vh)"};var Garde={x:82.25,y:49,w:10.32,h:24.25,transform:"scale(3) translate(-31vw, 6vw)"};var Femmevoilerose={transform:"scale(4) translate(-22vw, 20vh)"};var Hommeauchapeau={x:61.25,y:54,w:11.32,h:27.25,transform:"scale(3) translate(-17vw, 7vw)"};var Barbegriseprofil={x:0.25,y:54,w:12.32,h:29.25,transform:"scale(3) translate(32vw, 8vw)"};var GardeCenter={x:82.25,y:62,w:11.32,h:27.25,transform:"scale(3) translate(-30vw, 12vw)"};var HommeLouche={x:48.25,y:59,w:9.32,h:24.25,transform:"scale(3) translate(-3vw, 8vw)"};var FemmeLouche={transform:"scale(3) translate(-8vw, 8vw)"};var coordinates = {Barbegrisebandeau:Barbegrisebandeau,Hommeorange:Hommeorange,Jesus:Jesus,MaindelHommeOrange:MaindelHommeOrange,MaindelHommeOrangeZoom:MaindelHommeOrangeZoom,"FemmeDenudée":{x:72.25,y:27,w:24.32,h:55.25,transform:"scale(3) translate(-27vw, 7vw)"},HommeDuFond:HommeDuFond,HommeDuFondCenter:HommeDuFondCenter,Dameauxperles:Dameauxperles,Garde:Garde,Femmevoilerose:Femmevoilerose,"FemmeDenudéeTop":{transform:"scale(3) translate(-27vw, 0vh)"},Hommeauchapeau:Hommeauchapeau,Barbegriseprofil:Barbegriseprofil,GardeCenter:GardeCenter,HommeLouche:HommeLouche,FemmeLouche:FemmeLouche};

    const wait = (ms) => new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve();
      }, ms);
    });

    const dialogIndexToBgpos = (index) => {
      if((index >= 28 && index <= 40) || index == 56 || index == 62){
        return "top";
      }else {
        return "center";
      }
    };

    /* src/components/Adventure.svelte generated by Svelte v3.46.4 */
    const file$4 = "src/components/Adventure.svelte";

    // (91:26) 
    function create_if_block_1$1(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "clickDiv svelte-puxjun");
    			set_style(div, "width", /*clickCoords*/ ctx[5].w + "%");
    			set_style(div, "height", /*clickCoords*/ ctx[5].h + "%");
    			set_style(div, "bottom", /*clickCoords*/ ctx[5].y + "%");
    			set_style(div, "left", /*clickCoords*/ ctx[5].x + "%");
    			add_location(div, file$4, 91, 1, 2852);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*handleClickDiv*/ ctx[10], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*clickCoords*/ 32) {
    				set_style(div, "width", /*clickCoords*/ ctx[5].w + "%");
    			}

    			if (dirty & /*clickCoords*/ 32) {
    				set_style(div, "height", /*clickCoords*/ ctx[5].h + "%");
    			}

    			if (dirty & /*clickCoords*/ 32) {
    				set_style(div, "bottom", /*clickCoords*/ ctx[5].y + "%");
    			}

    			if (dirty & /*clickCoords*/ 32) {
    				set_style(div, "left", /*clickCoords*/ ctx[5].x + "%");
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(91:26) ",
    		ctx
    	});

    	return block;
    }

    // (89:0) {#if dialogs[$currentDialogIndex].text !== ""}
    function create_if_block$1(ctx) {
    	let dialog;
    	let current;

    	dialog = new Dialog({
    			props: { first: /*$currentDialogIndex*/ ctx[2] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			create_component(dialog.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(dialog, target, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			const dialog_changes = {};
    			if (dirty & /*$currentDialogIndex*/ 4) dialog_changes.first = /*$currentDialogIndex*/ ctx[2];
    			dialog.$set(dialog_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(dialog.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(dialog.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(dialog, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(89:0) {#if dialogs[$currentDialogIndex].text !== \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$4(ctx) {
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t0;
    	let div1;
    	let img1;
    	let img1_src_value;
    	let t1;
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block$1, create_if_block_1$1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (dialogs[/*$currentDialogIndex*/ ctx[2]].text !== "") return 0;
    		if (/*displayClickDiv*/ ctx[9]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			img0 = element("img");
    			t0 = space();
    			div1 = element("div");
    			img1 = element("img");
    			t1 = space();
    			if (if_block) if_block.c();
    			if_block_anchor = empty();
    			if (!src_url_equal(img0.src, img0_src_value = "/img/pictures/" + /*nextPictureSafe*/ ctx[4])) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "class", "svelte-puxjun");
    			toggle_class(img0, "center", /*backImgPos*/ ctx[7] === "center");
    			add_location(img0, file$4, 83, 1, 2419);
    			attr_dev(div0, "class", "pictureBg svelte-puxjun");
    			add_location(div0, file$4, 82, 0, 2394);
    			if (!src_url_equal(img1.src, img1_src_value = "/img/pictures/" + /*pictureSafe*/ ctx[0])) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "class", "svelte-puxjun");
    			toggle_class(img1, "center", /*frontImgPos*/ ctx[8] === "center");
    			add_location(img1, file$4, 86, 1, 2646);
    			attr_dev(div1, "class", "pictureBg svelte-puxjun");
    			set_style(div1, "--transform", /*transform*/ ctx[1]);
    			toggle_class(div1, "opacityTransition", /*opacityTransitionOn*/ ctx[6]);
    			add_location(div1, file$4, 85, 0, 2513);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, img0);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img1);
    			/*div1_binding*/ ctx[11](div1);
    			insert_dev(target, t1, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*nextPictureSafe*/ 16 && !src_url_equal(img0.src, img0_src_value = "/img/pictures/" + /*nextPictureSafe*/ ctx[4])) {
    				attr_dev(img0, "src", img0_src_value);
    			}

    			if (dirty & /*backImgPos*/ 128) {
    				toggle_class(img0, "center", /*backImgPos*/ ctx[7] === "center");
    			}

    			if (!current || dirty & /*pictureSafe*/ 1 && !src_url_equal(img1.src, img1_src_value = "/img/pictures/" + /*pictureSafe*/ ctx[0])) {
    				attr_dev(img1, "src", img1_src_value);
    			}

    			if (dirty & /*frontImgPos*/ 256) {
    				toggle_class(img1, "center", /*frontImgPos*/ ctx[8] === "center");
    			}

    			if (!current || dirty & /*transform*/ 2) {
    				set_style(div1, "--transform", /*transform*/ ctx[1]);
    			}

    			if (dirty & /*opacityTransitionOn*/ 64) {
    				toggle_class(div1, "opacityTransition", /*opacityTransitionOn*/ ctx[6]);
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block = if_blocks[current_block_type_index];

    					if (!if_block) {
    						if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block.c();
    					} else {
    						if_block.p(ctx, dirty);
    					}

    					transition_in(if_block, 1);
    					if_block.m(if_block_anchor.parentNode, if_block_anchor);
    				} else {
    					if_block = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div1);
    			/*div1_binding*/ ctx[11](null);
    			if (detaching) detach_dev(t1);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $currentDialogIndex;
    	validate_store(currentDialogIndex, 'currentDialogIndex');
    	component_subscribe($$self, currentDialogIndex, $$value => $$invalidate(2, $currentDialogIndex = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Adventure', slots, []);
    	let mainPictureBg;
    	let nextPictureSafe = pictures[dialogs[$currentDialogIndex + 1].picture];
    	let pictureSafe = pictures[dialogs[$currentDialogIndex].picture];
    	let clickCoords = null;
    	let opacityTransitionOn = false;
    	let transform = "scale(1) translate(0vw, 0vw)";
    	let backImgPos = dialogIndexToBgpos($currentDialogIndex + 1);
    	let frontImgPos = dialogIndexToBgpos($currentDialogIndex);
    	let displayClickDiv = false;

    	function handleClickDiv() {
    		$$invalidate(9, displayClickDiv = false);
    		set_store_value(currentDialogIndex, $currentDialogIndex += 1, $currentDialogIndex);
    	}

    	async function pictureTransition() {
    		try {
    			if (pictures[dialogs[$currentDialogIndex].picture] !== pictureSafe) {
    				$$invalidate(6, opacityTransitionOn = true);
    				$$invalidate(3, mainPictureBg.style.opacity = 0, mainPictureBg);
    				await wait(1000);
    				$$invalidate(6, opacityTransitionOn = false);
    				$$invalidate(0, pictureSafe = pictures[dialogs[$currentDialogIndex].picture]);
    				$$invalidate(8, frontImgPos = dialogIndexToBgpos($currentDialogIndex));
    				await wait(100); // fix flash on transition
    				$$invalidate(3, mainPictureBg.style.opacity = null, mainPictureBg);
    			} else {
    				$$invalidate(8, frontImgPos = dialogIndexToBgpos($currentDialogIndex));
    			}

    			let nextDialog = dialogs[$currentDialogIndex + 1];

    			if (nextDialog) {
    				if (nextDialog.picture) {
    					$$invalidate(4, nextPictureSafe = pictures[nextDialog.picture]);
    					$$invalidate(7, backImgPos = dialogIndexToBgpos($currentDialogIndex + 1));
    				}
    			}
    		} catch(err) {
    			
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Adventure> was created with unknown prop '${key}'`);
    	});

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			mainPictureBg = $$value;
    			$$invalidate(3, mainPictureBg);
    		});
    	}

    	$$self.$capture_state = () => ({
    		Dialog,
    		pictures,
    		dialogs,
    		coordinates,
    		currentDialogIndex,
    		wait,
    		dialogIndexToBgpos,
    		mainPictureBg,
    		nextPictureSafe,
    		pictureSafe,
    		clickCoords,
    		opacityTransitionOn,
    		transform,
    		backImgPos,
    		frontImgPos,
    		displayClickDiv,
    		handleClickDiv,
    		pictureTransition,
    		$currentDialogIndex
    	});

    	$$self.$inject_state = $$props => {
    		if ('mainPictureBg' in $$props) $$invalidate(3, mainPictureBg = $$props.mainPictureBg);
    		if ('nextPictureSafe' in $$props) $$invalidate(4, nextPictureSafe = $$props.nextPictureSafe);
    		if ('pictureSafe' in $$props) $$invalidate(0, pictureSafe = $$props.pictureSafe);
    		if ('clickCoords' in $$props) $$invalidate(5, clickCoords = $$props.clickCoords);
    		if ('opacityTransitionOn' in $$props) $$invalidate(6, opacityTransitionOn = $$props.opacityTransitionOn);
    		if ('transform' in $$props) $$invalidate(1, transform = $$props.transform);
    		if ('backImgPos' in $$props) $$invalidate(7, backImgPos = $$props.backImgPos);
    		if ('frontImgPos' in $$props) $$invalidate(8, frontImgPos = $$props.frontImgPos);
    		if ('displayClickDiv' in $$props) $$invalidate(9, displayClickDiv = $$props.displayClickDiv);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$currentDialogIndex*/ 4) {
    			{
    				if ($currentDialogIndex) {
    					pictureTransition();
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*transform, $currentDialogIndex, pictureSafe*/ 7) {
    			{
    				let prevTransform = transform;

    				if (typeof dialogs[$currentDialogIndex].zoom !== "undefined") {
    					$$invalidate(1, transform = coordinates[dialogs[$currentDialogIndex].zoom].transform);
    				} else {
    					$$invalidate(1, transform = "scale(1) translate(0vw, 0vw)");
    				}

    				if (typeof dialogs[$currentDialogIndex].click !== "undefined") {
    					$$invalidate(5, clickCoords = coordinates[dialogs[$currentDialogIndex].click]);

    					if (prevTransform !== transform) {
    						setTimeout(
    							() => {
    								$$invalidate(9, displayClickDiv = true);
    							},
    							2000
    						);
    					} else if (pictures[dialogs[$currentDialogIndex].picture] !== pictureSafe) {
    						setTimeout(
    							() => {
    								$$invalidate(9, displayClickDiv = true);
    							},
    							1000
    						);
    					} else {
    						$$invalidate(9, displayClickDiv = true);
    					}
    				} else {
    					$$invalidate(5, clickCoords = null);
    					$$invalidate(9, displayClickDiv = false);
    				}
    			}
    		}
    	};

    	return [
    		pictureSafe,
    		transform,
    		$currentDialogIndex,
    		mainPictureBg,
    		nextPictureSafe,
    		clickCoords,
    		opacityTransitionOn,
    		backImgPos,
    		frontImgPos,
    		displayClickDiv,
    		handleClickDiv,
    		div1_binding
    	];
    }

    class Adventure extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Adventure",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/components/PleaseTurn.svelte generated by Svelte v3.46.4 */

    const file$3 = "src/components/PleaseTurn.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let img;
    	let img_src_value;
    	let t0;
    	let p;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			t0 = space();
    			p = element("p");
    			p.textContent = "Tournez votre écran";
    			if (!src_url_equal(img.src, img_src_value = "/img/deco/refresh-ccw.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-1nqwcr1");
    			add_location(img, file$3, 1, 2, 25);
    			attr_dev(p, "class", "font-cinzel svelte-1nqwcr1");
    			add_location(p, file$3, 2, 2, 72);
    			attr_dev(div, "class", "mustTurn svelte-1nqwcr1");
    			add_location(div, file$3, 0, 0, 0);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    			append_dev(div, t0);
    			append_dev(div, p);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$3($$self, $$props) {
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('PleaseTurn', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<PleaseTurn> was created with unknown prop '${key}'`);
    	});

    	return [];
    }

    class PleaseTurn extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PleaseTurn",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/HomePage.svelte generated by Svelte v3.46.4 */
    const file$2 = "src/components/HomePage.svelte";

    function create_fragment$2(ctx) {
    	let div7;
    	let div0;
    	let t0;
    	let div3;
    	let div2;
    	let p0;
    	let t2;
    	let div1;
    	let t3;
    	let div6;
    	let h1;
    	let t5;
    	let div5;
    	let p1;
    	let t7;
    	let div4;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div3 = element("div");
    			div2 = element("div");
    			p0 = element("p");
    			p0.textContent = "CREDITS";
    			t2 = space();
    			div1 = element("div");
    			t3 = space();
    			div6 = element("div");
    			h1 = element("h1");
    			h1.textContent = "REGARDS";
    			t5 = space();
    			div5 = element("div");
    			p1 = element("p");
    			p1.textContent = "VIVRE L'EXPÉRIENCE";
    			t7 = space();
    			div4 = element("div");
    			attr_dev(div0, "class", "dark svelte-4q5x06");
    			add_location(div0, file$2, 5, 2, 99);
    			attr_dev(p0, "class", "font-cinzel svelte-4q5x06");
    			add_location(p0, file$2, 8, 6, 175);
    			attr_dev(div1, "class", "underline svelte-4q5x06");
    			add_location(div1, file$2, 9, 6, 254);
    			attr_dev(div2, "class", "button svelte-4q5x06");
    			add_location(div2, file$2, 7, 4, 148);
    			attr_dev(div3, "class", "top svelte-4q5x06");
    			add_location(div3, file$2, 6, 2, 126);
    			attr_dev(h1, "class", "font-cinzel svelte-4q5x06");
    			add_location(h1, file$2, 13, 4, 331);
    			attr_dev(p1, "class", "font-cinzel svelte-4q5x06");
    			add_location(p1, file$2, 15, 6, 399);
    			attr_dev(div4, "class", "underline svelte-4q5x06");
    			add_location(div4, file$2, 19, 6, 550);
    			attr_dev(div5, "class", "button svelte-4q5x06");
    			add_location(div5, file$2, 14, 4, 372);
    			attr_dev(div6, "class", "bottom svelte-4q5x06");
    			add_location(div6, file$2, 12, 2, 306);
    			attr_dev(div7, "class", "home svelte-4q5x06");
    			add_location(div7, file$2, 4, 0, 78);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div0);
    			append_dev(div7, t0);
    			append_dev(div7, div3);
    			append_dev(div3, div2);
    			append_dev(div2, p0);
    			append_dev(div2, t2);
    			append_dev(div2, div1);
    			append_dev(div7, t3);
    			append_dev(div7, div6);
    			append_dev(div6, h1);
    			append_dev(div6, t5);
    			append_dev(div6, div5);
    			append_dev(div5, p1);
    			append_dev(div5, t7);
    			append_dev(div5, div4);

    			if (!mounted) {
    				dispose = [
    					listen_dev(p0, "click", /*click_handler*/ ctx[2], false, false, false),
    					listen_dev(p1, "click", /*click_handler_1*/ ctx[3], false, false, false)
    				];

    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
    			mounted = false;
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$2($$self, $$props, $$invalidate) {
    	let $isCredits;
    	let $isAdventure;
    	validate_store(isCredits, 'isCredits');
    	component_subscribe($$self, isCredits, $$value => $$invalidate(0, $isCredits = $$value));
    	validate_store(isAdventure, 'isAdventure');
    	component_subscribe($$self, isAdventure, $$value => $$invalidate(1, $isAdventure = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('HomePage', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<HomePage> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		set_store_value(isCredits, $isCredits = true, $isCredits);
    	};

    	const click_handler_1 = () => {
    		document.body.requestFullscreen();
    		set_store_value(isAdventure, $isAdventure = true, $isAdventure);
    	};

    	$$self.$capture_state = () => ({
    		isAdventure,
    		isCredits,
    		$isCredits,
    		$isAdventure
    	});

    	return [$isCredits, $isAdventure, click_handler, click_handler_1];
    }

    class HomePage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HomePage",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/Credits.svelte generated by Svelte v3.46.4 */
    const file$1 = "src/components/Credits.svelte";

    function create_fragment$1(ctx) {
    	let div16;
    	let div2;
    	let h1;
    	let t1;
    	let div1;
    	let p0;
    	let t3;
    	let div0;
    	let t4;
    	let div15;
    	let div7;
    	let div3;
    	let h20;
    	let t6;
    	let p1;
    	let t8;
    	let p2;
    	let t10;
    	let div4;
    	let h21;
    	let t12;
    	let p3;
    	let t14;
    	let p4;
    	let t16;
    	let div5;
    	let h22;
    	let t18;
    	let p5;
    	let t20;
    	let p6;
    	let t22;
    	let div6;
    	let h23;
    	let t24;
    	let p7;
    	let t26;
    	let p8;
    	let t28;
    	let div8;
    	let t29;
    	let div14;
    	let div9;
    	let h24;
    	let t31;
    	let p9;
    	let t33;
    	let p10;
    	let t35;
    	let p11;
    	let t37;
    	let p12;
    	let t39;
    	let div13;
    	let h25;
    	let t41;
    	let div12;
    	let div10;
    	let p13;
    	let t43;
    	let p14;
    	let t45;
    	let p15;
    	let t47;
    	let p16;
    	let t49;
    	let div11;
    	let p17;
    	let t51;
    	let p18;
    	let t53;
    	let p19;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div16 = element("div");
    			div2 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Crédits";
    			t1 = space();
    			div1 = element("div");
    			p0 = element("p");
    			p0.textContent = "Retour";
    			t3 = space();
    			div0 = element("div");
    			t4 = space();
    			div15 = element("div");
    			div7 = element("div");
    			div3 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Le Christ et la femme adultère";
    			t6 = space();
    			p1 = element("p");
    			p1.textContent = "PORTA dit SALVIATI Le Jeune Giuseppe Della";
    			t8 = space();
    			p2 = element("p");
    			p2.textContent = "16e siècle";
    			t10 = space();
    			div4 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Pierre, Jeanne et André enfants";
    			t12 = space();
    			p3 = element("p");
    			p3.textContent = "SCHNEGG Gaston";
    			t14 = space();
    			p4 = element("p");
    			p4.textContent = "1911";
    			t16 = space();
    			div5 = element("div");
    			h22 = element("h2");
    			h22.textContent = "Portrait de femme";
    			t18 = space();
    			p5 = element("p");
    			p5.textContent = "DUPAIN Edmond Louis";
    			t20 = space();
    			p6 = element("p");
    			p6.textContent = "1886";
    			t22 = space();
    			div6 = element("div");
    			h23 = element("h2");
    			h23.textContent = "Remerciements";
    			t24 = space();
    			p7 = element("p");
    			p7.textContent = "Musée des beaux-arts & sara la dame du musée";
    			t26 = space();
    			p8 = element("p");
    			p8.textContent = "Alexis Benoit, Clément Casanas, Thibault Charron & Bastien De L’hermite";
    			t28 = space();
    			div8 = element("div");
    			t29 = space();
    			div14 = element("div");
    			div9 = element("div");
    			h24 = element("h2");
    			h24.textContent = "Musiques";
    			t31 = space();
    			p9 = element("p");
    			p9.textContent = "Vivaldi Winter";
    			t33 = space();
    			p10 = element("p");
    			p10.textContent = "Violin Concerto in A Minor RV356 presto";
    			t35 = space();
    			p11 = element("p");
    			p11.textContent = "Schumann - Les 13 Scènes d'enfants";
    			t37 = space();
    			p12 = element("p");
    			p12.textContent = "schubert symphony inachevée";
    			t39 = space();
    			div13 = element("div");
    			h25 = element("h2");
    			h25.textContent = "Notre équipe";
    			t41 = space();
    			div12 = element("div");
    			div10 = element("div");
    			p13 = element("p");
    			p13.textContent = "Maxime LASSERRE";
    			t43 = space();
    			p14 = element("p");
    			p14.textContent = "Samuel LABAGNERE";
    			t45 = space();
    			p15 = element("p");
    			p15.textContent = "Naja DALMAGNE";
    			t47 = space();
    			p16 = element("p");
    			p16.textContent = "Martin DUCONSEIL";
    			t49 = space();
    			div11 = element("div");
    			p17 = element("p");
    			p17.textContent = "Léa RAULT";
    			t51 = space();
    			p18 = element("p");
    			p18.textContent = "Emma FOUILLAT";
    			t53 = space();
    			p19 = element("p");
    			p19.textContent = "Enzo DURET";
    			attr_dev(h1, "class", "svelte-t79uuu");
    			add_location(h1, file$1, 6, 4, 126);
    			attr_dev(p0, "class", "svelte-t79uuu");
    			add_location(p0, file$1, 8, 6, 174);
    			attr_dev(div0, "class", "underline svelte-t79uuu");
    			add_location(div0, file$1, 9, 6, 233);
    			attr_dev(div1, "class", "button svelte-t79uuu");
    			add_location(div1, file$1, 7, 4, 147);
    			attr_dev(div2, "class", "top font-cinzel svelte-t79uuu");
    			add_location(div2, file$1, 5, 2, 92);
    			attr_dev(h20, "class", "svelte-t79uuu");
    			add_location(h20, file$1, 16, 8, 364);
    			attr_dev(p1, "class", "svelte-t79uuu");
    			add_location(p1, file$1, 17, 8, 412);
    			attr_dev(p2, "class", "svelte-t79uuu");
    			add_location(p2, file$1, 18, 8, 470);
    			attr_dev(div3, "class", "block svelte-t79uuu");
    			add_location(div3, file$1, 15, 6, 336);
    			attr_dev(h21, "class", "svelte-t79uuu");
    			add_location(h21, file$1, 22, 8, 536);
    			attr_dev(p3, "class", "svelte-t79uuu");
    			add_location(p3, file$1, 23, 8, 585);
    			attr_dev(p4, "class", "svelte-t79uuu");
    			add_location(p4, file$1, 24, 8, 615);
    			attr_dev(div4, "class", "block svelte-t79uuu");
    			add_location(div4, file$1, 21, 6, 508);
    			attr_dev(h22, "class", "svelte-t79uuu");
    			add_location(h22, file$1, 28, 8, 675);
    			attr_dev(p5, "class", "svelte-t79uuu");
    			add_location(p5, file$1, 29, 8, 710);
    			attr_dev(p6, "class", "svelte-t79uuu");
    			add_location(p6, file$1, 30, 8, 745);
    			attr_dev(div5, "class", "block svelte-t79uuu");
    			add_location(div5, file$1, 27, 6, 647);
    			attr_dev(h23, "class", "svelte-t79uuu");
    			add_location(h23, file$1, 34, 8, 805);
    			attr_dev(p7, "class", "svelte-t79uuu");
    			add_location(p7, file$1, 35, 8, 836);
    			attr_dev(p8, "class", "svelte-t79uuu");
    			add_location(p8, file$1, 36, 8, 896);
    			attr_dev(div6, "class", "block svelte-t79uuu");
    			add_location(div6, file$1, 33, 6, 777);
    			attr_dev(div7, "class", "left svelte-t79uuu");
    			add_location(div7, file$1, 14, 4, 311);
    			attr_dev(div8, "class", "separator svelte-t79uuu");
    			add_location(div8, file$1, 40, 4, 1004);
    			attr_dev(h24, "class", "svelte-t79uuu");
    			add_location(h24, file$1, 44, 8, 1099);
    			attr_dev(p9, "class", "svelte-t79uuu");
    			add_location(p9, file$1, 45, 8, 1125);
    			attr_dev(p10, "class", "svelte-t79uuu");
    			add_location(p10, file$1, 46, 8, 1155);
    			attr_dev(p11, "class", "svelte-t79uuu");
    			add_location(p11, file$1, 47, 8, 1210);
    			attr_dev(p12, "class", "svelte-t79uuu");
    			add_location(p12, file$1, 48, 8, 1260);
    			attr_dev(div9, "class", "block music svelte-t79uuu");
    			add_location(div9, file$1, 43, 6, 1065);
    			attr_dev(h25, "class", "svelte-t79uuu");
    			add_location(h25, file$1, 52, 8, 1343);
    			attr_dev(p13, "class", "svelte-t79uuu");
    			add_location(p13, file$1, 56, 12, 1439);
    			attr_dev(p14, "class", "svelte-t79uuu");
    			add_location(p14, file$1, 57, 12, 1474);
    			attr_dev(p15, "class", "svelte-t79uuu");
    			add_location(p15, file$1, 58, 12, 1510);
    			attr_dev(p16, "class", "svelte-t79uuu");
    			add_location(p16, file$1, 59, 12, 1543);
    			attr_dev(div10, "class", "column");
    			add_location(div10, file$1, 55, 10, 1406);
    			attr_dev(p17, "class", "svelte-t79uuu");
    			add_location(p17, file$1, 63, 12, 1630);
    			attr_dev(p18, "class", "svelte-t79uuu");
    			add_location(p18, file$1, 64, 12, 1659);
    			attr_dev(p19, "class", "svelte-t79uuu");
    			add_location(p19, file$1, 65, 12, 1692);
    			attr_dev(div11, "class", "column");
    			add_location(div11, file$1, 62, 10, 1597);
    			attr_dev(div12, "class", "columns svelte-t79uuu");
    			add_location(div12, file$1, 54, 8, 1374);
    			attr_dev(div13, "class", "block svelte-t79uuu");
    			add_location(div13, file$1, 51, 6, 1315);
    			attr_dev(div14, "class", "right svelte-t79uuu");
    			add_location(div14, file$1, 42, 4, 1039);
    			attr_dev(div15, "class", "bottom svelte-t79uuu");
    			add_location(div15, file$1, 13, 2, 286);
    			attr_dev(div16, "class", "credits svelte-t79uuu");
    			add_location(div16, file$1, 4, 0, 68);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div16, anchor);
    			append_dev(div16, div2);
    			append_dev(div2, h1);
    			append_dev(div2, t1);
    			append_dev(div2, div1);
    			append_dev(div1, p0);
    			append_dev(div1, t3);
    			append_dev(div1, div0);
    			append_dev(div16, t4);
    			append_dev(div16, div15);
    			append_dev(div15, div7);
    			append_dev(div7, div3);
    			append_dev(div3, h20);
    			append_dev(div3, t6);
    			append_dev(div3, p1);
    			append_dev(div3, t8);
    			append_dev(div3, p2);
    			append_dev(div7, t10);
    			append_dev(div7, div4);
    			append_dev(div4, h21);
    			append_dev(div4, t12);
    			append_dev(div4, p3);
    			append_dev(div4, t14);
    			append_dev(div4, p4);
    			append_dev(div7, t16);
    			append_dev(div7, div5);
    			append_dev(div5, h22);
    			append_dev(div5, t18);
    			append_dev(div5, p5);
    			append_dev(div5, t20);
    			append_dev(div5, p6);
    			append_dev(div7, t22);
    			append_dev(div7, div6);
    			append_dev(div6, h23);
    			append_dev(div6, t24);
    			append_dev(div6, p7);
    			append_dev(div6, t26);
    			append_dev(div6, p8);
    			append_dev(div15, t28);
    			append_dev(div15, div8);
    			append_dev(div15, t29);
    			append_dev(div15, div14);
    			append_dev(div14, div9);
    			append_dev(div9, h24);
    			append_dev(div9, t31);
    			append_dev(div9, p9);
    			append_dev(div9, t33);
    			append_dev(div9, p10);
    			append_dev(div9, t35);
    			append_dev(div9, p11);
    			append_dev(div9, t37);
    			append_dev(div9, p12);
    			append_dev(div14, t39);
    			append_dev(div14, div13);
    			append_dev(div13, h25);
    			append_dev(div13, t41);
    			append_dev(div13, div12);
    			append_dev(div12, div10);
    			append_dev(div10, p13);
    			append_dev(div10, t43);
    			append_dev(div10, p14);
    			append_dev(div10, t45);
    			append_dev(div10, p15);
    			append_dev(div10, t47);
    			append_dev(div10, p16);
    			append_dev(div12, t49);
    			append_dev(div12, div11);
    			append_dev(div11, p17);
    			append_dev(div11, t51);
    			append_dev(div11, p18);
    			append_dev(div11, t53);
    			append_dev(div11, p19);

    			if (!mounted) {
    				dispose = listen_dev(p0, "click", /*click_handler*/ ctx[1], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div16);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$1($$self, $$props, $$invalidate) {
    	let $isCredits;
    	validate_store(isCredits, 'isCredits');
    	component_subscribe($$self, isCredits, $$value => $$invalidate(0, $isCredits = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Credits', slots, []);
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Credits> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		set_store_value(isCredits, $isCredits = false, $isCredits);
    	};

    	$$self.$capture_state = () => ({ isCredits, $isCredits });
    	return [$isCredits, click_handler];
    }

    class Credits extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Credits",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.46.4 */

    const { window: window_1 } = globals;
    const file = "src/App.svelte";

    // (30:2) {:else}
    function create_else_block(ctx) {
    	let homepage;
    	let current;
    	homepage = new HomePage({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(homepage.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(homepage, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(homepage.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(homepage.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(homepage, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block.name,
    		type: "else",
    		source: "(30:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (28:23) 
    function create_if_block_2(ctx) {
    	let credits;
    	let current;
    	credits = new Credits({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(credits.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(credits, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(credits.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(credits.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(credits, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(28:23) ",
    		ctx
    	});

    	return block;
    }

    // (26:2) {#if $isAdventure}
    function create_if_block_1(ctx) {
    	let adventure;
    	let current;
    	adventure = new Adventure({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(adventure.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(adventure, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(adventure.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(adventure.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(adventure, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(26:2) {#if $isAdventure}",
    		ctx
    	});

    	return block;
    }

    // (23:1) {#if mustTurn}
    function create_if_block(ctx) {
    	let pleaseturn;
    	let current;
    	pleaseturn = new PleaseTurn({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(pleaseturn.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(pleaseturn, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(pleaseturn.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(pleaseturn.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(pleaseturn, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block.name,
    		type: "if",
    		source: "(23:1) {#if mustTurn}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let main;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block, create_if_block_1, create_if_block_2, create_else_block];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*mustTurn*/ ctx[0]) return 0;
    		if (/*$isAdventure*/ ctx[1]) return 1;
    		if (/*$isCredits*/ ctx[2]) return 2;
    		return 3;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			main = element("main");
    			if_block.c();
    			attr_dev(main, "class", "svelte-1azx8u2");
    			add_location(main, file, 21, 0, 502);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, main, anchor);
    			if_blocks[current_block_type_index].m(main, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window_1, "resize", /*checkScreen*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index !== previous_block_index) {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				}

    				transition_in(if_block, 1);
    				if_block.m(main, null);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(main);
    			if_blocks[current_block_type_index].d();
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let $isAdventure;
    	let $isCredits;
    	validate_store(isAdventure, 'isAdventure');
    	component_subscribe($$self, isAdventure, $$value => $$invalidate(1, $isAdventure = $$value));
    	validate_store(isCredits, 'isCredits');
    	component_subscribe($$self, isCredits, $$value => $$invalidate(2, $isCredits = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);
    	let mustTurn;
    	checkScreen();

    	function checkScreen() {
    		if (window.innerHeight > window.innerWidth) {
    			$$invalidate(0, mustTurn = true);
    		} else {
    			$$invalidate(0, mustTurn = false);
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		Adventure,
    		PleaseTurn,
    		HomePage,
    		Credits,
    		isAdventure,
    		isCredits,
    		mustTurn,
    		checkScreen,
    		$isAdventure,
    		$isCredits
    	});

    	$$self.$inject_state = $$props => {
    		if ('mustTurn' in $$props) $$invalidate(0, mustTurn = $$props.mustTurn);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [mustTurn, $isAdventure, $isCredits, checkScreen];
    }

    class App extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "App",
    			options,
    			id: create_fragment.name
    		});
    	}
    }

    const app = new App({
    	target: document.getElementById("svelte")
    });

    return app;

})();
//# sourceMappingURL=bundle.js.map
