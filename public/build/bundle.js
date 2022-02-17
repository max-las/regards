
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
    function get_store_value(store) {
        let value;
        subscribe(store, _ => value = _)();
        return value;
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

    var dialogs = [{character:"",text:" Un beau matin de printemps s’annonce à Bordeaux. Au musée des Beaux-Arts, trois frères et sœurs visitent l’aile sud du bâtiment.",picture:"museum_outside"},{character:"",text:"Voici Léo, André et Camille…",picture:"children"},{character:"",text:"Alors qu'ils déambulent dans le musée, un tableau retient leur attention...",picture:"children"},{character:"",text:"Face à eux, accroché en hauteur, un tableau d’une taille imposante se dresse...",picture:"framed"},{character:"",text:"Un sentiment très particulier les anime alors...",picture:"children"},{character:"",text:"À ce moment précis, une chose est certaine, cette oeuvre à su attirer leur attention...",picture:"children"},{character:"Leo",text:"<span style=\"font-weight: 800\">Léo :</span> Il est drôle celui-là, on dirait qu’il se passe plein de choses à la fois.",picture:"children"},{character:"Camille",text:"<span style=\"font-weight: 800\">Camille :</span> Ils se regardent tous comme s'ils discutaient entre eux.",picture:"children"},{character:"Leo",text:"<span style=\"font-weight: 800\">Léo :</span> L’homme avec une grande barbe grise semble cacher quelque chose...",picture:"children"},{character:"Leo",text:"<span style=\"font-weight: 800\">Léo :</span> Moi, j’ai l'impression que…",picture:"framed"},{character:"",text:"",picture:"christ",click:"Barbegrisebandeau"},{character:"Barbegrisebandeau",text:"« Je sais que c’est vous ! Je vous ai vu ! »",picture:"christ",zoom:"Barbegrisebandeau"},{character:"Hommeorange",text:"« Comment osez-vous ?! »",picture:"christ",zoom:"Hommeorange"},{character:"Jesus",text:"« Mes frères, celui qui a volé doit se dénoncer ! »",picture:"christ"},{character:"Jesus",text:"« Le bien de cette dame doit lui être rendu ! »",picture:"christ"},{character:"",text:"",picture:"christ",click:"Hommeorange"},{character:"Hommeorange",text:"« Très bien, j’avoue, J’ai vu cet homme voler la bourse ! C’est lui le fourbe ! »",picture:"christ",zoom:"Hommeorange"},{character:"Barbegrisebandeau",text:"« Comment osez-vous ? Il est possible d’identifier le voleur d’un simple regard ! »",picture:"christ",zoom:"Barbegrisebandeau"},{character:"Jesus",text:"« Mais comment saviez-vous que c’est une bourse qui a été volée ? »",picture:"christ",zoom:"Jesus"},{character:"Hommeorange",text:"« Euuuh et bien… »",picture:"christ",zoom:"Barbegrisebandeau"},{character:"",text:"",picture:"christ",click:"MaindelHommeOrange"},{character:"",text:"",picture:"christ",zoom:"MaindelHommeOrange",click:"MaindelHommeOrangeZoom"},{character:"Jesus",text:"« Ah ah ! Pris la main dans le sac ! »",picture:"christ"},{character:"",text:"",picture:"christ",click:"FemmeDenudée"},{character:"FemmeDenudée",text:"« Oooh merci ! Je suis heureuse que vous ayez retrouvé le voleur ! »",picture:"christ",zoom:"FemmeDenudée"},{character:"André",text:"<span style=\"font-weight: 800\">André :</span> Ppfffffft n’importe quoi ton histoire !",picture:"children"},{character:"André",text:"<span style=\"font-weight: 800\">André :</span> Regarde plutôt l’homme au fond. Il paraît louche.",picture:"children"},{character:"André",text:"<span style=\"font-weight: 800\">André :</span> Pour moi l’histoire de ce tableau, c’est clairement…",picture:"framed"},{character:"",text:"",picture:"christ",click:"HommeDuFond"},{character:"HommeDuFond",text:"« Cet homme possède une arme ! Il  prépare un mauvais coup. »",picture:"christ",zoom:"HommeDuFond"},{character:"HommeDuFond",text:"« Je pense qu’il s'apprête à tuer ! »",picture:"christ",zoom:"HommeDuFond"},{character:"",text:"« La commère du village, derrière, en saura forcément plus. »",picture:"christ",zoom:"HommeDuFond"},{character:"",text:"",picture:"christ",click:"Dameauxperles"},{character:"Dameauxperles",text:"« Oui, je sais tout. C’est sûr ! Il veut tuer la femme. C’est sûr ! D’ailleurs, regardez-le, il a l’air coupable ! »",picture:"christ",zoom:"Dameauxperles"},{character:"Dameauxperles",text:"« Il faut prévenir les gardes ! »",picture:"christ",zoom:"Dameauxperles"},{character:"",text:"",picture:"christ",click:"Garde"},{character:"Garde",text:"« Ne vous inquiétez pas madame, je ne laisserai personne mourir ! »",picture:"christ",zoom:"Garde"},{character:"Garde",text:"« Halte-là ! Vous ne ferez de mal à personne aujourd'hui ! »",picture:"christ"},{character:"Femmevoilerose",text:"« Lâchez-moi garde ! Je suis innocent ! Cette femme est une voleuse. Elle ne m’a jamais remboursée ! »",picture:"christ",zoom:"Femmevoilerose"},{character:"Garde",text:"« Silence malotru ! Je vais te jeter au cachot ! Il ne pourra plus vous faire de mal madame. »",picture:"christ",zoom:"Garde"},{character:"FemmeDenudée",text:"« Me voilà soulagée ! Merci garde ! »",picture:"christ",zoom:"FemmeDenudéeTop"},{character:"André",text:"<span style=\"font-weight: 800\">André :</span> Et heureusement, elle est sauvée et n’a plus de dettes.",picture:"children"},{character:"Camille",text:"<span style=\"font-weight: 800\">Camille :</span> Mais non, gros bêta, ils sont en train de débattre pour construire un village.",picture:"children"},{character:"Camille",text:"<span style=\"font-weight: 800\">Camille :</span> Donc ce qu’il se passe réellement…",picture:"framed"},{character:"",text:"",picture:"christ",click:"Hommeauchapeau"},{character:"Hommeauchapeau",text:"« Ecoutez-moi ! Nous devons prendre une décision avant la tombée de la nuit ! »",picture:"christ",zoom:"Hommeauchapeau"},{character:"FemmeDenudée",text:"« Oui, grand chef du village, si nous ne trouvons pas où dormir, cela pourrait être dangereux ! »",picture:"christ",zoom:"FemmeDenudée"},{character:"FemmeDenudée",text:"« Quelqu’un a une idée ? »",picture:"christ",zoom:"Hommeauchapeau"},{character:"",text:"",picture:"christ",click:"Barbegriseprofil"},{character:"Barbegriseprofil",text:"« Si on construit ma grange, elle sera assez grande pour que nous puissions tous dormir dedans, ce sera rapide et utile ! »",picture:"christ",zoom:"Barbegriseprofil"},{character:"",text:"",picture:"christ",click:"GardeCenter"},{character:"Garde",text:"« N’oubliez pas le prisonnier, il faut construire une prison en priorité ! Et le bâtiment sera assez grand. »",picture:"christ",zoom:"GardeCenter"},{character:"",text:"",picture:"christ",click:"HommeLouche"},{character:"HommeLouche",text:"« Excusez-moi, mais ils nous faut des chambres séparées. Plusieurs cabanes feront l’affaire. »",picture:"christ",zoom:"HommeLouche"},{character:"FemmeLouche",text:"« Je ne supporte pas la paille. Sans compter qu’on mourra de froid dans une prison. »",picture:"christ",zoom:"FemmeLouche"},{character:"FemmeDenudée",text:"« Il faut qu’une personne neutre tranche. »",picture:"christ",zoom:"FemmeDenudée"},{character:"HommeDuFond",text:"« Puis-je aider ? »",picture:"christ",zoom:"HommeDuFond"},{character:"Hommeauchapeau",text:"« Euh, pourquoi pas... Donnons la parole au plus reclud de notre groupe. »",picture:"christ",zoom:"Hommeauchapeau"},{character:"FemmeDenudée",text:"« Alors, que le prisonnier décide ! »",picture:"christ",zoom:"FemmeDenudée"},{character:"",text:"",picture:"christ",click:"GardeCenter"},{character:"Garde",text:"« Il en est hors de question ! »",picture:"christ",zoom:"GardeCenter"},{character:"Hommeauchapeau",text:"« Il nous faut un regard extérieur, il est donc le mieux placé. »",picture:"christ",zoom:"Hommeauchapeau"},{character:"HommeDuFond",text:"« Hé bien, je pense qu'avec le temps dont nous disposons, dormir dans la paille, dans une grange, est la meilleure solution. »",picture:"christ",zoom:"HommeDuFond"},{character:"Camille",text:"<span style=\"font-weight: 800\">Camille :</span> Et ils purent dormir tous au chaud !",picture:"children"},{character:"Leo",text:"<span style=\"font-weight: 800\">Léo :</span> Moi, je préfère mon histoire, elle était plus simple !",picture:"children"},{character:"André",text:"<span style=\"font-weight: 800\">André :</span> Oui, elle était sympa mais, la mienne était plus sérieuse.",picture:"children"},{character:"Camille",text:"<span style=\"font-weight: 800\">Camille :</span> Je préfère celle de Léo, mais avouez que la mienne est la plus intéressante.",picture:"children"},{character:"Intervenante",text:"<span style=\"font-weight: 800\">Guide :</span> Bonjour les enfants ! Ce tableau vous intrigue-t-il ?...",picture:"Intervenante"},{character:"Leo",text:"<span style=\"font-weight: 800\">Léo :</span> Oui, mais nous ne sommes pas d'accord sur l’histoire que le tableau raconte…",picture:"children"},{character:"Intervenante",text:"<span style=\"font-weight: 800\">Guide :</span> Je comprends, et c’est bien normal que vous ne tombiez pas d’accord… Ce tableau s’inspire de la Bible et il en narre une partie.",picture:"Intervenante"},{character:"Intervenante",text:"<span style=\"font-weight: 800\">Guide :</span> Mais ce n’est pas important, car chacune de vos interprétations à travers vos histoires est aussi intéressante que l’original.",picture:"Intervenante"}];

    var Leo={icon:"Leo.png",size:"normal"};var Camille={icon:"Camille.png",size:"normal"};var Barbegrisebandeau$1={icon:"Barbegrisebandeau.png",size:"small"};var Barbegriseprofil$1={icon:"barbegriseprofil.png",size:"small"};var Dameauxperles$1={icon:"Dameauxperles.png",size:"small"};var FemmeLouche$1={icon:"FemmeLouche.png",size:"small"};var Femmevoilerose$1={icon:"Femmevoilerose.png",size:"small"};var Garde$1={icon:"garde.png",size:"small"};var Hommeauchapeau$1={icon:"Hommeauchapeau.png",size:"small"};var HommeDuFond$1={icon:"HommeDuFond.png",size:"small"};var HommeLouche$1={icon:"HommeLouche.png",size:"small"};var Hommeorange$1={icon:"Hommeorange.png",size:"small"};var Hommeturbanfond={icon:"Hommeturbanfond.png",size:"small"};var Jesus$1={icon:"Jesus.png",size:"small"};var Intervenante$1={icon:"Intervenante_fondue.png",size:"normal"};var characters = {Leo:Leo,"André":{icon:"Andre.png",size:"normal"},Camille:Camille,Barbegrisebandeau:Barbegrisebandeau$1,Barbegriseprofil:Barbegriseprofil$1,Dameauxperles:Dameauxperles$1,"FemmeDenudée":{icon:"FemmeDenudée.png",size:"small"},FemmeLouche:FemmeLouche$1,Femmevoilerose:Femmevoilerose$1,Garde:Garde$1,Hommeauchapeau:Hommeauchapeau$1,HommeDuFond:HommeDuFond$1,HommeLouche:HommeLouche$1,Hommeorange:Hommeorange$1,Hommeturbanfond:Hommeturbanfond,Jesus:Jesus$1,Intervenante:Intervenante$1};

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
    const prevDialogIndex = writable(null);
    const forwardDialog = writable(() => {
      let index = get_store_value(currentDialogIndex);
      prevDialogIndex.set(index);
      currentDialogIndex.set(index + 1);
    });
    const backwardDialog = writable(() => {
      let index = get_store_value(currentDialogIndex);
      if(index > 0){
        prevDialogIndex.set(index);
        currentDialogIndex.set(index - 1);
      }
    });

    const isAdventure = writable(false);
    const isCredits = writable(false);
    const confirmedMusic = writable(false);

    const currentMusics = writable([]);
    const soundEffects = writable({
      menuClick: null
    });

    /* src/components/Dialog.svelte generated by Svelte v3.46.4 */
    const file$7 = "src/components/Dialog.svelte";

    // (29:6) {#if dialogs[$currentDialogIndex].character !== ""}
    function create_if_block$3(ctx) {
    	let img;
    	let img_class_value;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", img_class_value = "" + (null_to_empty(characters[dialogs[/*$currentDialogIndex*/ ctx[1]].character].size) + " svelte-1yr6zda"));
    			if (!src_url_equal(img.src, img_src_value = "img/characters/" + characters[dialogs[/*$currentDialogIndex*/ ctx[1]].character].icon)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$7, 29, 8, 721);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*$currentDialogIndex*/ 2 && img_class_value !== (img_class_value = "" + (null_to_empty(characters[dialogs[/*$currentDialogIndex*/ ctx[1]].character].size) + " svelte-1yr6zda"))) {
    				attr_dev(img, "class", img_class_value);
    			}

    			if (dirty & /*$currentDialogIndex*/ 2 && !src_url_equal(img.src, img_src_value = "img/characters/" + characters[dialogs[/*$currentDialogIndex*/ ctx[1]].character].icon)) {
    				attr_dev(img, "src", img_src_value);
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$3.name,
    		type: "if",
    		source: "(29:6) {#if dialogs[$currentDialogIndex].character !== \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$7(ctx) {
    	let div4;
    	let div3;
    	let div0;
    	let t0;
    	let p0;
    	let raw_value = dialogs[/*$currentDialogIndex*/ ctx[1]].text + "";
    	let t1;
    	let div2;
    	let p1;
    	let t3;
    	let div1;
    	let t4;
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;
    	let if_block = dialogs[/*$currentDialogIndex*/ ctx[1]].character !== "" && create_if_block$3(ctx);

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			if (if_block) if_block.c();
    			t0 = space();
    			p0 = element("p");
    			t1 = space();
    			div2 = element("div");
    			p1 = element("p");
    			p1.textContent = "SUIVANT";
    			t3 = space();
    			div1 = element("div");
    			t4 = space();
    			img = element("img");
    			attr_dev(div0, "class", "character svelte-1yr6zda");
    			add_location(div0, file$7, 27, 4, 631);
    			attr_dev(p0, "class", "font-montserrat text svelte-1yr6zda");
    			add_location(p0, file$7, 32, 4, 906);
    			attr_dev(p1, "class", "font-cinzel nextButton svelte-1yr6zda");
    			add_location(p1, file$7, 34, 6, 1088);
    			attr_dev(div1, "class", "underline svelte-1yr6zda");
    			add_location(div1, file$7, 35, 6, 1140);
    			set_style(div2, "width", "fit-content");
    			attr_dev(div2, "class", "nextButtonContainer svelte-1yr6zda");
    			toggle_class(div2, "canContinue", /*canContinue*/ ctx[0]);
    			add_location(div2, file$7, 33, 4, 988);
    			attr_dev(div3, "class", "content svelte-1yr6zda");
    			add_location(div3, file$7, 26, 2, 605);
    			attr_dev(img, "class", "decoration svelte-1yr6zda");
    			if (!src_url_equal(img.src, img_src_value = "img/deco/cadre_decors.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$7, 38, 2, 1192);
    			attr_dev(div4, "class", "dialog svelte-1yr6zda");
    			add_location(div4, file$7, 25, 0, 566);
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
    			p0.innerHTML = raw_value;
    			append_dev(div3, t1);
    			append_dev(div3, div2);
    			append_dev(div2, p1);
    			append_dev(div2, t3);
    			append_dev(div2, div1);
    			append_dev(div4, t4);
    			append_dev(div4, img);

    			if (!mounted) {
    				dispose = listen_dev(div4, "click", /*next*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (dialogs[/*$currentDialogIndex*/ ctx[1]].character !== "") {
    				if (if_block) {
    					if_block.p(ctx, dirty);
    				} else {
    					if_block = create_if_block$3(ctx);
    					if_block.c();
    					if_block.m(div0, null);
    				}
    			} else if (if_block) {
    				if_block.d(1);
    				if_block = null;
    			}

    			if (dirty & /*$currentDialogIndex*/ 2 && raw_value !== (raw_value = dialogs[/*$currentDialogIndex*/ ctx[1]].text + "")) p0.innerHTML = raw_value;
    			if (dirty & /*canContinue*/ 1) {
    				toggle_class(div2, "canContinue", /*canContinue*/ ctx[0]);
    			}
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
    		id: create_fragment$7.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$7($$self, $$props, $$invalidate) {
    	let $isAdventure;
    	let $forwardDialog;
    	let $currentDialogIndex;
    	validate_store(isAdventure, 'isAdventure');
    	component_subscribe($$self, isAdventure, $$value => $$invalidate(4, $isAdventure = $$value));
    	validate_store(forwardDialog, 'forwardDialog');
    	component_subscribe($$self, forwardDialog, $$value => $$invalidate(5, $forwardDialog = $$value));
    	validate_store(currentDialogIndex, 'currentDialogIndex');
    	component_subscribe($$self, currentDialogIndex, $$value => $$invalidate(1, $currentDialogIndex = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Dialog', slots, []);
    	let { first } = $$props;
    	set_store_value(currentDialogIndex, $currentDialogIndex = first, $currentDialogIndex);
    	let canContinue = true;

    	function next() {
    		if (canContinue) {
    			if ($currentDialogIndex < dialogs.length - 1) {
    				$forwardDialog();
    				$$invalidate(0, canContinue = false);

    				setTimeout(
    					() => {
    						$$invalidate(0, canContinue = true);
    					},
    					1100
    				);
    			} else {
    				set_store_value(isAdventure, $isAdventure = false, $isAdventure);
    			}
    		}
    	}

    	const writable_props = ['first'];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Dialog> was created with unknown prop '${key}'`);
    	});

    	$$self.$$set = $$props => {
    		if ('first' in $$props) $$invalidate(3, first = $$props.first);
    	};

    	$$self.$capture_state = () => ({
    		dialogs,
    		characters,
    		currentDialogIndex,
    		isAdventure,
    		forwardDialog,
    		first,
    		canContinue,
    		next,
    		$isAdventure,
    		$forwardDialog,
    		$currentDialogIndex
    	});

    	$$self.$inject_state = $$props => {
    		if ('first' in $$props) $$invalidate(3, first = $$props.first);
    		if ('canContinue' in $$props) $$invalidate(0, canContinue = $$props.canContinue);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [canContinue, $currentDialogIndex, next, first];
    }

    class Dialog extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$7, create_fragment$7, safe_not_equal, { first: 3 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Dialog",
    			options,
    			id: create_fragment$7.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*first*/ ctx[3] === undefined && !('first' in props)) {
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

    var museum_outside="museum_outside.jpg";var children="Enfants_2.png";var framed="framed.png";var christ="christ.png";var Intervenante="Intervenante.png";var pictures = {museum_outside:museum_outside,children:children,framed:framed,christ:christ,Intervenante:Intervenante};

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

    const audioFadeIn = (audio) => {
      if(typeof audio.audioCtx === "undefined"){
        setupAudioContext(audio);
      }
      audio.audioGain.gain.value = "0";
      audio.play();
      let interval = setInterval(function(){
        let newVolume = audio.audioGain.gain.value + 0.1;
        if(newVolume >= 1){
          newVolume = 1;
          clearInterval(interval);
        }
        audio.audioGain.gain.value = newVolume;
      }, 300);
      if(typeof audio.fadeInterval !== "undefined"){
        clearInterval(audio.fadeInterval);
        audio.fadeInterval = interval;
      }else {
        Object.defineProperty(audio, "fadeInterval", {
          value: interval,
          writable: true
        });
      }
    };

    const audioFadeOut = (audio) => {
      if(typeof audio.audioCtx === "undefined"){
        setupAudioContext(audio);
      }
      let interval = setInterval(function(){
        let newVolume = audio.audioGain.gain.value - 0.1;
        if(newVolume <= 0){
          newVolume = 0;
          audio.pause();
          clearInterval(interval);
        }
        audio.audioGain.gain.value = newVolume;
      }, 300);
      if(typeof audio.fadeInterval !== "undefined"){
        clearInterval(audio.fadeInterval);
        audio.fadeInterval = interval;
      }else {
        Object.defineProperty(audio, "fadeInterval", {
          value: interval,
          writable: true
        });
      }
    };

    function setupAudioContext(audio){
      Object.defineProperty(audio, "audioCtx", {
        value: new AudioContext(),
        writable: true
      });
      Object.defineProperty(audio, "audioSource", {
        value: audio.audioCtx.createMediaElementSource(audio),
        writable: true
      });
      Object.defineProperty(audio, "audioGain", {
        value: audio.audioCtx.createGain(),
        writable: true
      });
      audio.audioSource.connect(audio.audioGain);
      audio.audioGain.connect(audio.audioCtx.destination);
    }

    /* src/components/Adventure.svelte generated by Svelte v3.46.4 */

    const { console: console_1 } = globals;
    const file$6 = "src/components/Adventure.svelte";

    // (130:0) {#if prevPictureSafe}
    function create_if_block_3$1(ctx) {
    	let div;
    	let img;
    	let img_src_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			img = element("img");
    			if (!src_url_equal(img.src, img_src_value = "/img/pictures/" + /*prevPictureSafe*/ ctx[6])) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-1ra9nla");
    			toggle_class(img, "center", /*prevImgPos*/ ctx[9] === "center");
    			add_location(img, file$6, 131, 2, 4327);
    			attr_dev(div, "class", "pictureBg svelte-1ra9nla");
    			add_location(div, file$6, 130, 1, 4301);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, img);
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*prevPictureSafe*/ 64 && !src_url_equal(img.src, img_src_value = "/img/pictures/" + /*prevPictureSafe*/ ctx[6])) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*prevImgPos*/ 512) {
    				toggle_class(img, "center", /*prevImgPos*/ ctx[9] === "center");
    			}
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_3$1.name,
    		type: "if",
    		source: "(130:0) {#if prevPictureSafe}",
    		ctx
    	});

    	return block;
    }

    // (141:0) {#if $currentDialogIndex > 0}
    function create_if_block_2$1(ctx) {
    	let img;
    	let img_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			img = element("img");
    			attr_dev(img, "class", "backArrow svelte-1ra9nla");
    			if (!src_url_equal(img.src, img_src_value = "/img/deco/backArrow.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$6, 141, 1, 4875);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, img, anchor);

    			if (!mounted) {
    				dispose = listen_dev(img, "click", /*handleBackArrow*/ ctx[14], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(img);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_2$1.name,
    		type: "if",
    		source: "(141:0) {#if $currentDialogIndex > 0}",
    		ctx
    	});

    	return block;
    }

    // (146:26) 
    function create_if_block_1$2(ctx) {
    	let div;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div = element("div");
    			attr_dev(div, "class", "clickDiv svelte-1ra9nla");
    			set_style(div, "width", /*clickCoords*/ ctx[10].w + "%");
    			set_style(div, "height", /*clickCoords*/ ctx[10].h + "%");
    			set_style(div, "bottom", /*clickCoords*/ ctx[10].y + "%");
    			set_style(div, "left", /*clickCoords*/ ctx[10].x + "%");
    			add_location(div, file$6, 146, 1, 5081);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);

    			if (!mounted) {
    				dispose = listen_dev(div, "click", /*handleClickDiv*/ ctx[13], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, dirty) {
    			if (dirty & /*clickCoords*/ 1024) {
    				set_style(div, "width", /*clickCoords*/ ctx[10].w + "%");
    			}

    			if (dirty & /*clickCoords*/ 1024) {
    				set_style(div, "height", /*clickCoords*/ ctx[10].h + "%");
    			}

    			if (dirty & /*clickCoords*/ 1024) {
    				set_style(div, "bottom", /*clickCoords*/ ctx[10].y + "%");
    			}

    			if (dirty & /*clickCoords*/ 1024) {
    				set_style(div, "left", /*clickCoords*/ ctx[10].x + "%");
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
    		id: create_if_block_1$2.name,
    		type: "if",
    		source: "(146:26) ",
    		ctx
    	});

    	return block;
    }

    // (144:0) {#if dialogs[$currentDialogIndex].text !== ""}
    function create_if_block$2(ctx) {
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
    		id: create_if_block$2.name,
    		type: "if",
    		source: "(144:0) {#if dialogs[$currentDialogIndex].text !== \\\"\\\"}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$6(ctx) {
    	let t0;
    	let div0;
    	let img0;
    	let img0_src_value;
    	let t1;
    	let div1;
    	let img1;
    	let img1_src_value;
    	let t2;
    	let t3;
    	let current_block_type_index;
    	let if_block2;
    	let if_block2_anchor;
    	let current;
    	let if_block0 = /*prevPictureSafe*/ ctx[6] && create_if_block_3$1(ctx);
    	let if_block1 = /*$currentDialogIndex*/ ctx[2] > 0 && create_if_block_2$1(ctx);
    	const if_block_creators = [create_if_block$2, create_if_block_1$2];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (dialogs[/*$currentDialogIndex*/ ctx[2]].text !== "") return 0;
    		if (/*displayClickDiv*/ ctx[12]) return 1;
    		return -1;
    	}

    	if (~(current_block_type_index = select_block_type(ctx))) {
    		if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    	}

    	const block = {
    		c: function create() {
    			if (if_block0) if_block0.c();
    			t0 = space();
    			div0 = element("div");
    			img0 = element("img");
    			t1 = space();
    			div1 = element("div");
    			img1 = element("img");
    			t2 = space();
    			if (if_block1) if_block1.c();
    			t3 = space();
    			if (if_block2) if_block2.c();
    			if_block2_anchor = empty();
    			if (!src_url_equal(img0.src, img0_src_value = "/img/pictures/" + /*nextPictureSafe*/ ctx[5])) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "class", "svelte-1ra9nla");
    			toggle_class(img0, "opacityTransition", /*opacityTransitionOn*/ ctx[11]);
    			toggle_class(img0, "center", /*nextImgPos*/ ctx[7] === "center");
    			add_location(img0, file$6, 135, 1, 4477);
    			attr_dev(div0, "class", "pictureBg svelte-1ra9nla");
    			add_location(div0, file$6, 134, 0, 4428);
    			if (!src_url_equal(img1.src, img1_src_value = "/img/pictures/" + /*pictureSafe*/ ctx[0])) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			attr_dev(img1, "class", "svelte-1ra9nla");
    			toggle_class(img1, "center", /*currentImgPos*/ ctx[8] === "center");
    			add_location(img1, file$6, 138, 1, 4751);
    			attr_dev(div1, "class", "pictureBg svelte-1ra9nla");
    			set_style(div1, "--transform", /*transform*/ ctx[1]);
    			toggle_class(div1, "opacityTransition", /*opacityTransitionOn*/ ctx[11]);
    			add_location(div1, file$6, 137, 0, 4619);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			if (if_block0) if_block0.m(target, anchor);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div0, anchor);
    			append_dev(div0, img0);
    			/*div0_binding*/ ctx[15](div0);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img1);
    			/*div1_binding*/ ctx[16](div1);
    			insert_dev(target, t2, anchor);
    			if (if_block1) if_block1.m(target, anchor);
    			insert_dev(target, t3, anchor);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].m(target, anchor);
    			}

    			insert_dev(target, if_block2_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (/*prevPictureSafe*/ ctx[6]) {
    				if (if_block0) {
    					if_block0.p(ctx, dirty);
    				} else {
    					if_block0 = create_if_block_3$1(ctx);
    					if_block0.c();
    					if_block0.m(t0.parentNode, t0);
    				}
    			} else if (if_block0) {
    				if_block0.d(1);
    				if_block0 = null;
    			}

    			if (!current || dirty & /*nextPictureSafe*/ 32 && !src_url_equal(img0.src, img0_src_value = "/img/pictures/" + /*nextPictureSafe*/ ctx[5])) {
    				attr_dev(img0, "src", img0_src_value);
    			}

    			if (dirty & /*opacityTransitionOn*/ 2048) {
    				toggle_class(img0, "opacityTransition", /*opacityTransitionOn*/ ctx[11]);
    			}

    			if (dirty & /*nextImgPos*/ 128) {
    				toggle_class(img0, "center", /*nextImgPos*/ ctx[7] === "center");
    			}

    			if (!current || dirty & /*pictureSafe*/ 1 && !src_url_equal(img1.src, img1_src_value = "/img/pictures/" + /*pictureSafe*/ ctx[0])) {
    				attr_dev(img1, "src", img1_src_value);
    			}

    			if (dirty & /*currentImgPos*/ 256) {
    				toggle_class(img1, "center", /*currentImgPos*/ ctx[8] === "center");
    			}

    			if (!current || dirty & /*transform*/ 2) {
    				set_style(div1, "--transform", /*transform*/ ctx[1]);
    			}

    			if (dirty & /*opacityTransitionOn*/ 2048) {
    				toggle_class(div1, "opacityTransition", /*opacityTransitionOn*/ ctx[11]);
    			}

    			if (/*$currentDialogIndex*/ ctx[2] > 0) {
    				if (if_block1) {
    					if_block1.p(ctx, dirty);
    				} else {
    					if_block1 = create_if_block_2$1(ctx);
    					if_block1.c();
    					if_block1.m(t3.parentNode, t3);
    				}
    			} else if (if_block1) {
    				if_block1.d(1);
    				if_block1 = null;
    			}

    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if (~current_block_type_index) {
    					if_blocks[current_block_type_index].p(ctx, dirty);
    				}
    			} else {
    				if (if_block2) {
    					group_outros();

    					transition_out(if_blocks[previous_block_index], 1, 1, () => {
    						if_blocks[previous_block_index] = null;
    					});

    					check_outros();
    				}

    				if (~current_block_type_index) {
    					if_block2 = if_blocks[current_block_type_index];

    					if (!if_block2) {
    						if_block2 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    						if_block2.c();
    					} else {
    						if_block2.p(ctx, dirty);
    					}

    					transition_in(if_block2, 1);
    					if_block2.m(if_block2_anchor.parentNode, if_block2_anchor);
    				} else {
    					if_block2 = null;
    				}
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(if_block2);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(if_block2);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (if_block0) if_block0.d(detaching);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div0);
    			/*div0_binding*/ ctx[15](null);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(div1);
    			/*div1_binding*/ ctx[16](null);
    			if (detaching) detach_dev(t2);
    			if (if_block1) if_block1.d(detaching);
    			if (detaching) detach_dev(t3);

    			if (~current_block_type_index) {
    				if_blocks[current_block_type_index].d(detaching);
    			}

    			if (detaching) detach_dev(if_block2_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$6.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$6($$self, $$props, $$invalidate) {
    	let $currentDialogIndex;
    	let $prevDialogIndex;
    	let $forwardDialog;
    	let $currentMusics;
    	validate_store(currentDialogIndex, 'currentDialogIndex');
    	component_subscribe($$self, currentDialogIndex, $$value => $$invalidate(2, $currentDialogIndex = $$value));
    	validate_store(prevDialogIndex, 'prevDialogIndex');
    	component_subscribe($$self, prevDialogIndex, $$value => $$invalidate(17, $prevDialogIndex = $$value));
    	validate_store(forwardDialog, 'forwardDialog');
    	component_subscribe($$self, forwardDialog, $$value => $$invalidate(18, $forwardDialog = $$value));
    	validate_store(currentMusics, 'currentMusics');
    	component_subscribe($$self, currentMusics, $$value => $$invalidate(19, $currentMusics = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Adventure', slots, []);
    	let frontPicture, nextPicture;
    	let nextPictureSafe = pictures[dialogs[$currentDialogIndex + 1].picture];
    	let pictureSafe = pictures[dialogs[$currentDialogIndex].picture];
    	let prevPictureSafe = null;
    	let nextImgPos = dialogIndexToBgpos($currentDialogIndex + 1);
    	let currentImgPos = dialogIndexToBgpos($currentDialogIndex);
    	let prevImgPos = null;
    	let clickCoords = null;
    	let opacityTransitionOn = false;
    	let transform = "scale(1) translate(0vw, 0vw)";
    	let displayClickDiv = false;

    	function handleClickDiv() {
    		$$invalidate(12, displayClickDiv = false);
    		$forwardDialog();
    	}

    	function handleBackArrow() {
    		// $backwardDialog();
    		calcCoords();
    	}

    	function calcCoords() {
    		let posX = 28.81;
    		let posY = 35.78;
    		let img = frontPicture.querySelector("img");
    		let translateX = window.innerWidth * ((50 - posX) / 100);
    		let translateY = img.offsetHeight * ((50 - posY) / 100);
    		console.log(`translate(${translateX}px, ${translateY}px)`);
    	}

    	async function pictureTransition() {
    		try {
    			if (pictures[dialogs[$currentDialogIndex].picture] !== pictureSafe) {
    				$$invalidate(11, opacityTransitionOn = true);
    				$$invalidate(3, frontPicture.style.opacity = 0, frontPicture);

    				if ($currentDialogIndex < $prevDialogIndex) {
    					$$invalidate(4, nextPicture.style.opacity = 0, nextPicture);
    				}

    				await wait(1000);
    				$$invalidate(11, opacityTransitionOn = false);
    				$$invalidate(0, pictureSafe = pictures[dialogs[$currentDialogIndex].picture]);
    				$$invalidate(8, currentImgPos = dialogIndexToBgpos($currentDialogIndex));
    				await wait(100); // fix flash on transition
    				$$invalidate(3, frontPicture.style.opacity = null, frontPicture);
    				$$invalidate(4, nextPicture.style.opacity = null, nextPicture);
    			} else {
    				$$invalidate(8, currentImgPos = dialogIndexToBgpos($currentDialogIndex));
    			}

    			let nextDialog = dialogs[$currentDialogIndex + 1];

    			if (nextDialog) {
    				if (nextDialog.picture) {
    					$$invalidate(5, nextPictureSafe = pictures[nextDialog.picture]);
    					$$invalidate(7, nextImgPos = dialogIndexToBgpos($currentDialogIndex + 1));
    				}
    			}

    			let prevDialog = dialogs[$currentDialogIndex - 1];

    			if (prevDialog) {
    				if (prevDialog.picture) {
    					$$invalidate(6, prevPictureSafe = pictures[prevDialog.picture]);
    					$$invalidate(9, prevImgPos = dialogIndexToBgpos($currentDialogIndex - 1));
    				}
    			}
    		} catch(err) {
    			
    		}
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console_1.warn(`<Adventure> was created with unknown prop '${key}'`);
    	});

    	function div0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			nextPicture = $$value;
    			$$invalidate(4, nextPicture);
    		});
    	}

    	function div1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			frontPicture = $$value;
    			$$invalidate(3, frontPicture);
    		});
    	}

    	$$self.$capture_state = () => ({
    		Dialog,
    		pictures,
    		dialogs,
    		coordinates,
    		currentDialogIndex,
    		prevDialogIndex,
    		currentMusics,
    		forwardDialog,
    		backwardDialog,
    		wait,
    		dialogIndexToBgpos,
    		frontPicture,
    		nextPicture,
    		nextPictureSafe,
    		pictureSafe,
    		prevPictureSafe,
    		nextImgPos,
    		currentImgPos,
    		prevImgPos,
    		clickCoords,
    		opacityTransitionOn,
    		transform,
    		displayClickDiv,
    		handleClickDiv,
    		handleBackArrow,
    		calcCoords,
    		pictureTransition,
    		$currentDialogIndex,
    		$prevDialogIndex,
    		$forwardDialog,
    		$currentMusics
    	});

    	$$self.$inject_state = $$props => {
    		if ('frontPicture' in $$props) $$invalidate(3, frontPicture = $$props.frontPicture);
    		if ('nextPicture' in $$props) $$invalidate(4, nextPicture = $$props.nextPicture);
    		if ('nextPictureSafe' in $$props) $$invalidate(5, nextPictureSafe = $$props.nextPictureSafe);
    		if ('pictureSafe' in $$props) $$invalidate(0, pictureSafe = $$props.pictureSafe);
    		if ('prevPictureSafe' in $$props) $$invalidate(6, prevPictureSafe = $$props.prevPictureSafe);
    		if ('nextImgPos' in $$props) $$invalidate(7, nextImgPos = $$props.nextImgPos);
    		if ('currentImgPos' in $$props) $$invalidate(8, currentImgPos = $$props.currentImgPos);
    		if ('prevImgPos' in $$props) $$invalidate(9, prevImgPos = $$props.prevImgPos);
    		if ('clickCoords' in $$props) $$invalidate(10, clickCoords = $$props.clickCoords);
    		if ('opacityTransitionOn' in $$props) $$invalidate(11, opacityTransitionOn = $$props.opacityTransitionOn);
    		if ('transform' in $$props) $$invalidate(1, transform = $$props.transform);
    		if ('displayClickDiv' in $$props) $$invalidate(12, displayClickDiv = $$props.displayClickDiv);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*$currentDialogIndex*/ 4) {
    			{
    				pictureTransition();

    				if ($currentDialogIndex >= 0 && $currentDialogIndex < 3) {
    					set_store_value(currentMusics, $currentMusics = ["musicMuseeExt", "musicMuseeExtAmbiance"], $currentMusics);
    				} else if ($currentDialogIndex >= 3 && $currentDialogIndex < 10) {
    					set_store_value(currentMusics, $currentMusics = ["musicMuseeExt", "musicMuseeAmbiance"], $currentMusics);
    				} else if ($currentDialogIndex >= 10 && $currentDialogIndex < 25) {
    					set_store_value(currentMusics, $currentMusics = ["musicLeo"], $currentMusics);
    				} else if ($currentDialogIndex >= 25 && $currentDialogIndex < 28) {
    					set_store_value(currentMusics, $currentMusics = ["musicMuseeExt", "musicMuseeAmbiance"], $currentMusics);
    				} else if ($currentDialogIndex >= 28 && $currentDialogIndex < 41) {
    					set_store_value(currentMusics, $currentMusics = ["musicAndre"], $currentMusics);
    				} else if ($currentDialogIndex >= 41 && $currentDialogIndex < 44) {
    					set_store_value(currentMusics, $currentMusics = ["musicMuseeExt", "musicMuseeAmbiance"], $currentMusics);
    				} else if ($currentDialogIndex >= 44 && $currentDialogIndex < 63) {
    					set_store_value(currentMusics, $currentMusics = ["musicCamille"], $currentMusics);
    				} else if ($currentDialogIndex >= 63 && $currentDialogIndex < 67) {
    					set_store_value(currentMusics, $currentMusics = ["musicMuseeExt", "musicMuseeAmbiance"], $currentMusics);
    				} else if ($currentDialogIndex >= 67) {
    					set_store_value(currentMusics, $currentMusics = ["musicIntervenante", "musicMuseeAmbiance"], $currentMusics);
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
    					$$invalidate(10, clickCoords = coordinates[dialogs[$currentDialogIndex].click]);

    					if (prevTransform !== transform) {
    						setTimeout(
    							() => {
    								$$invalidate(12, displayClickDiv = true);
    							},
    							2000
    						);
    					} else if (pictures[dialogs[$currentDialogIndex].picture] !== pictureSafe) {
    						setTimeout(
    							() => {
    								$$invalidate(12, displayClickDiv = true);
    							},
    							1000
    						);
    					} else {
    						$$invalidate(12, displayClickDiv = true);
    					}
    				} else {
    					$$invalidate(10, clickCoords = null);
    					$$invalidate(12, displayClickDiv = false);
    				}
    			}
    		}
    	};

    	return [
    		pictureSafe,
    		transform,
    		$currentDialogIndex,
    		frontPicture,
    		nextPicture,
    		nextPictureSafe,
    		prevPictureSafe,
    		nextImgPos,
    		currentImgPos,
    		prevImgPos,
    		clickCoords,
    		opacityTransitionOn,
    		displayClickDiv,
    		handleClickDiv,
    		handleBackArrow,
    		div0_binding,
    		div1_binding
    	];
    }

    class Adventure extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$6, create_fragment$6, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Adventure",
    			options,
    			id: create_fragment$6.name
    		});
    	}
    }

    /* src/components/PleaseTurn.svelte generated by Svelte v3.46.4 */

    const file$5 = "src/components/PleaseTurn.svelte";

    function create_fragment$5(ctx) {
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
    			add_location(img, file$5, 1, 2, 25);
    			attr_dev(p, "class", "font-cinzel svelte-1nqwcr1");
    			add_location(p, file$5, 2, 2, 72);
    			attr_dev(div, "class", "mustTurn svelte-1nqwcr1");
    			add_location(div, file$5, 0, 0, 0);
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
    		id: create_fragment$5.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$5($$self, $$props) {
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
    		init(this, options, instance$5, create_fragment$5, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PleaseTurn",
    			options,
    			id: create_fragment$5.name
    		});
    	}
    }

    /* src/components/HomePage.svelte generated by Svelte v3.46.4 */

    const file$4 = "src/components/HomePage.svelte";

    function create_fragment$4(ctx) {
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
    			attr_dev(div0, "class", "dark svelte-16ttej1");
    			add_location(div0, file$4, 12, 2, 256);
    			attr_dev(p0, "class", "font-cinzel svelte-16ttej1");
    			add_location(p0, file$4, 15, 6, 332);
    			attr_dev(div1, "class", "underline svelte-16ttej1");
    			add_location(div1, file$4, 16, 6, 411);
    			attr_dev(div2, "class", "button svelte-16ttej1");
    			add_location(div2, file$4, 14, 4, 305);
    			attr_dev(div3, "class", "top svelte-16ttej1");
    			add_location(div3, file$4, 13, 2, 283);
    			attr_dev(h1, "class", "font-cinzel svelte-16ttej1");
    			add_location(h1, file$4, 20, 4, 488);
    			attr_dev(p1, "class", "font-cinzel svelte-16ttej1");
    			add_location(p1, file$4, 22, 6, 556);
    			attr_dev(div4, "class", "underline svelte-16ttej1");
    			add_location(div4, file$4, 23, 6, 631);
    			attr_dev(div5, "class", "button svelte-16ttej1");
    			add_location(div5, file$4, 21, 4, 529);
    			attr_dev(div6, "class", "bottom svelte-16ttej1");
    			add_location(div6, file$4, 19, 2, 463);
    			attr_dev(div7, "class", "home svelte-16ttej1");
    			add_location(div7, file$4, 11, 0, 235);
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
    					listen_dev(p1, "click", /*handleStart*/ ctx[1], false, false, false)
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
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance$4($$self, $$props, $$invalidate) {
    	let $isAdventure;
    	let $soundEffects;
    	let $currentMusics;
    	let $isCredits;
    	validate_store(isAdventure, 'isAdventure');
    	component_subscribe($$self, isAdventure, $$value => $$invalidate(3, $isAdventure = $$value));
    	validate_store(soundEffects, 'soundEffects');
    	component_subscribe($$self, soundEffects, $$value => $$invalidate(4, $soundEffects = $$value));
    	validate_store(currentMusics, 'currentMusics');
    	component_subscribe($$self, currentMusics, $$value => $$invalidate(5, $currentMusics = $$value));
    	validate_store(isCredits, 'isCredits');
    	component_subscribe($$self, isCredits, $$value => $$invalidate(0, $isCredits = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('HomePage', slots, []);
    	set_store_value(currentMusics, $currentMusics = ["musicMenu"], $currentMusics);

    	function handleStart() {
    		$soundEffects.menuClick?.play();
    		set_store_value(isAdventure, $isAdventure = true, $isAdventure);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<HomePage> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		set_store_value(isCredits, $isCredits = true, $isCredits);
    	};

    	$$self.$capture_state = () => ({
    		isAdventure,
    		isCredits,
    		soundEffects,
    		currentMusics,
    		handleStart,
    		$isAdventure,
    		$soundEffects,
    		$currentMusics,
    		$isCredits
    	});

    	return [$isCredits, handleStart, click_handler];
    }

    class HomePage extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "HomePage",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    /* src/components/Credits.svelte generated by Svelte v3.46.4 */
    const file$3 = "src/components/Credits.svelte";

    // (71:23) 
    function create_if_block_1$1(ctx) {
    	let div0;
    	let img;
    	let img_src_value;
    	let t0;
    	let div3;
    	let div1;
    	let h20;
    	let t2;
    	let p0;
    	let t4;
    	let p1;
    	let t6;
    	let div2;
    	let h21;
    	let t8;
    	let p2;
    	let t10;
    	let p3;
    	let t12;
    	let div7;
    	let div4;
    	let h22;
    	let t14;
    	let p4;
    	let t16;
    	let p5;
    	let t18;
    	let div5;
    	let h23;
    	let t20;
    	let p6;
    	let t22;
    	let p7;
    	let t24;
    	let div6;
    	let h24;
    	let t26;
    	let p8;
    	let t28;
    	let p9;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div0 = element("div");
    			img = element("img");
    			t0 = space();
    			div3 = element("div");
    			div1 = element("div");
    			h20 = element("h2");
    			h20.textContent = "le Christ et la femme adultère";
    			t2 = space();
    			p0 = element("p");
    			p0.textContent = "PORTA dit SALVIATI Le Jeune Giuseppe Della";
    			t4 = space();
    			p1 = element("p");
    			p1.textContent = "16e siècle";
    			t6 = space();
    			div2 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Portrait de Philippe Durand-Dassier";
    			t8 = space();
    			p2 = element("p");
    			p2.textContent = "Charles Emile Auguste DURAND dit CAROLUS-DURAN";
    			t10 = space();
    			p3 = element("p");
    			p3.textContent = "1876";
    			t12 = space();
    			div7 = element("div");
    			div4 = element("div");
    			h22 = element("h2");
    			h22.textContent = "Portrait de femme";
    			t14 = space();
    			p4 = element("p");
    			p4.textContent = "DUPAIN Edmond Louis";
    			t16 = space();
    			p5 = element("p");
    			p5.textContent = "1886";
    			t18 = space();
    			div5 = element("div");
    			h23 = element("h2");
    			h23.textContent = "Jeune pèlerin";
    			t20 = space();
    			p6 = element("p");
    			p6.textContent = "GRIMOU Alexis";
    			t22 = space();
    			p7 = element("p");
    			p7.textContent = "1732";
    			t24 = space();
    			div6 = element("div");
    			h24 = element("h2");
    			h24.textContent = "Tête de fillette";
    			t26 = space();
    			p8 = element("p");
    			p8.textContent = "LARÉE Antoine Marc Gustave";
    			t28 = space();
    			p9 = element("p");
    			p9.textContent = "1906";
    			attr_dev(img, "class", "arrow");
    			if (!src_url_equal(img.src, img_src_value = "/img/deco/creditsLeft.svg")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			add_location(img, file$3, 73, 4, 1616);
    			attr_dev(div0, "class", "left arrow svelte-bxepaf");
    			add_location(div0, file$3, 72, 2, 1587);
    			attr_dev(h20, "class", "svelte-bxepaf");
    			add_location(h20, file$3, 78, 6, 1764);
    			attr_dev(p0, "class", "svelte-bxepaf");
    			add_location(p0, file$3, 79, 6, 1810);
    			attr_dev(p1, "class", "svelte-bxepaf");
    			add_location(p1, file$3, 80, 6, 1866);
    			attr_dev(div1, "class", "block svelte-bxepaf");
    			add_location(div1, file$3, 77, 4, 1738);
    			attr_dev(h21, "class", "svelte-bxepaf");
    			add_location(h21, file$3, 84, 6, 1926);
    			attr_dev(p2, "class", "svelte-bxepaf");
    			add_location(p2, file$3, 85, 6, 1977);
    			attr_dev(p3, "class", "svelte-bxepaf");
    			add_location(p3, file$3, 86, 6, 2037);
    			attr_dev(div2, "class", "block svelte-bxepaf");
    			add_location(div2, file$3, 83, 4, 1900);
    			attr_dev(div3, "class", "middle svelte-bxepaf");
    			add_location(div3, file$3, 76, 2, 1713);
    			attr_dev(h22, "class", "svelte-bxepaf");
    			add_location(h22, file$3, 92, 6, 2122);
    			attr_dev(p4, "class", "svelte-bxepaf");
    			add_location(p4, file$3, 93, 6, 2155);
    			attr_dev(p5, "class", "svelte-bxepaf");
    			add_location(p5, file$3, 94, 6, 2188);
    			attr_dev(div4, "class", "block svelte-bxepaf");
    			add_location(div4, file$3, 91, 4, 2096);
    			attr_dev(h23, "class", "svelte-bxepaf");
    			add_location(h23, file$3, 98, 6, 2242);
    			attr_dev(p6, "class", "svelte-bxepaf");
    			add_location(p6, file$3, 99, 6, 2271);
    			attr_dev(p7, "class", "svelte-bxepaf");
    			add_location(p7, file$3, 100, 6, 2298);
    			attr_dev(div5, "class", "block svelte-bxepaf");
    			add_location(div5, file$3, 97, 4, 2216);
    			attr_dev(h24, "class", "svelte-bxepaf");
    			add_location(h24, file$3, 104, 6, 2352);
    			attr_dev(p8, "class", "svelte-bxepaf");
    			add_location(p8, file$3, 105, 6, 2384);
    			attr_dev(p9, "class", "svelte-bxepaf");
    			add_location(p9, file$3, 106, 6, 2424);
    			attr_dev(div6, "class", "block svelte-bxepaf");
    			add_location(div6, file$3, 103, 4, 2326);
    			attr_dev(div7, "class", "right svelte-bxepaf");
    			add_location(div7, file$3, 90, 2, 2072);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div0, anchor);
    			append_dev(div0, img);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, div3, anchor);
    			append_dev(div3, div1);
    			append_dev(div1, h20);
    			append_dev(div1, t2);
    			append_dev(div1, p0);
    			append_dev(div1, t4);
    			append_dev(div1, p1);
    			append_dev(div3, t6);
    			append_dev(div3, div2);
    			append_dev(div2, h21);
    			append_dev(div2, t8);
    			append_dev(div2, p2);
    			append_dev(div2, t10);
    			append_dev(div2, p3);
    			insert_dev(target, t12, anchor);
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div4);
    			append_dev(div4, h22);
    			append_dev(div4, t14);
    			append_dev(div4, p4);
    			append_dev(div4, t16);
    			append_dev(div4, p5);
    			append_dev(div7, t18);
    			append_dev(div7, div5);
    			append_dev(div5, h23);
    			append_dev(div5, t20);
    			append_dev(div5, p6);
    			append_dev(div5, t22);
    			append_dev(div5, p7);
    			append_dev(div7, t24);
    			append_dev(div7, div6);
    			append_dev(div6, h24);
    			append_dev(div6, t26);
    			append_dev(div6, p8);
    			append_dev(div6, t28);
    			append_dev(div6, p9);

    			if (!mounted) {
    				dispose = listen_dev(img, "click", /*click_handler_2*/ ctx[4], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div0);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(div3);
    			if (detaching) detach_dev(t12);
    			if (detaching) detach_dev(div7);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1$1.name,
    		type: "if",
    		source: "(71:23) ",
    		ctx
    	});

    	return block;
    }

    // (20:2) {#if page === 1}
    function create_if_block$1(ctx) {
    	let div5;
    	let div3;
    	let div2;
    	let div0;
    	let h20;
    	let t1;
    	let p0;
    	let t3;
    	let p1;
    	let t5;
    	let p2;
    	let t7;
    	let p3;
    	let t9;
    	let div1;
    	let p4;
    	let img0;
    	let img0_src_value;
    	let t10;
    	let t11;
    	let p5;
    	let t13;
    	let p6;
    	let t15;
    	let p7;
    	let t17;
    	let div4;
    	let h21;
    	let t19;
    	let p8;
    	let t21;
    	let p9;
    	let t23;
    	let div9;
    	let h22;
    	let t25;
    	let div6;
    	let h23;
    	let t27;
    	let p10;
    	let t29;
    	let div7;
    	let h24;
    	let t31;
    	let p11;
    	let t33;
    	let div8;
    	let h25;
    	let t35;
    	let p12;
    	let t37;
    	let div10;
    	let img1;
    	let img1_src_value;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			div0 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Notre équipe";
    			t1 = space();
    			p0 = element("p");
    			p0.textContent = "Maxime LASSERRE";
    			t3 = space();
    			p1 = element("p");
    			p1.textContent = "Samuel LABAGNERE";
    			t5 = space();
    			p2 = element("p");
    			p2.textContent = "Naja DALMAGNE";
    			t7 = space();
    			p3 = element("p");
    			p3.textContent = "Martin DUCONSEIL";
    			t9 = space();
    			div1 = element("div");
    			p4 = element("p");
    			img0 = element("img");
    			t10 = text("Bordeaux");
    			t11 = space();
    			p5 = element("p");
    			p5.textContent = "Léa RAULT";
    			t13 = space();
    			p6 = element("p");
    			p6.textContent = "Emma FOUILLAT";
    			t15 = space();
    			p7 = element("p");
    			p7.textContent = "Enzo DURET";
    			t17 = space();
    			div4 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Remerciements";
    			t19 = space();
    			p8 = element("p");
    			p8.textContent = "Musée des beaux-arts & sara la dame du musée";
    			t21 = space();
    			p9 = element("p");
    			p9.textContent = "Alexis Benoit, Clément Casanas, Thibault Charron & Bastien De L’hermite";
    			t23 = space();
    			div9 = element("div");
    			h22 = element("h2");
    			h22.textContent = "Musiques";
    			t25 = space();
    			div6 = element("div");
    			h23 = element("h2");
    			h23.textContent = "4 saisons - l'Hiver - Largo";
    			t27 = space();
    			p10 = element("p");
    			p10.textContent = "Vivaldi";
    			t29 = space();
    			div7 = element("div");
    			h24 = element("h2");
    			h24.textContent = "Les 13 scènes d'enfants";
    			t31 = space();
    			p11 = element("p");
    			p11.textContent = "Schumann";
    			t33 = space();
    			div8 = element("div");
    			h25 = element("h2");
    			h25.textContent = "Symphonie inachevée";
    			t35 = space();
    			p12 = element("p");
    			p12.textContent = "Schubert";
    			t37 = space();
    			div10 = element("div");
    			img1 = element("img");
    			attr_dev(h20, "class", "svelte-bxepaf");
    			add_location(h20, file$3, 25, 10, 485);
    			attr_dev(p0, "class", "svelte-bxepaf");
    			add_location(p0, file$3, 26, 10, 517);
    			attr_dev(p1, "class", "svelte-bxepaf");
    			add_location(p1, file$3, 27, 10, 550);
    			attr_dev(p2, "class", "svelte-bxepaf");
    			add_location(p2, file$3, 28, 10, 584);
    			attr_dev(p3, "class", "svelte-bxepaf");
    			add_location(p3, file$3, 29, 10, 615);
    			attr_dev(div0, "class", "column");
    			add_location(div0, file$3, 24, 8, 454);
    			if (!src_url_equal(img0.src, img0_src_value = "/img/deco/mmi.svg")) attr_dev(img0, "src", img0_src_value);
    			attr_dev(img0, "alt", "");
    			attr_dev(img0, "class", "svelte-bxepaf");
    			add_location(img0, file$3, 33, 25, 709);
    			attr_dev(p4, "class", "mmi svelte-bxepaf");
    			add_location(p4, file$3, 33, 10, 694);
    			attr_dev(p5, "class", "svelte-bxepaf");
    			add_location(p5, file$3, 34, 10, 765);
    			attr_dev(p6, "class", "svelte-bxepaf");
    			add_location(p6, file$3, 35, 10, 792);
    			attr_dev(p7, "class", "svelte-bxepaf");
    			add_location(p7, file$3, 36, 10, 823);
    			attr_dev(div1, "class", "column");
    			add_location(div1, file$3, 32, 8, 663);
    			attr_dev(div2, "class", "columns svelte-bxepaf");
    			add_location(div2, file$3, 23, 6, 424);
    			attr_dev(div3, "class", "block svelte-bxepaf");
    			add_location(div3, file$3, 22, 4, 398);
    			attr_dev(h21, "class", "svelte-bxepaf");
    			add_location(h21, file$3, 42, 6, 911);
    			attr_dev(p8, "class", "svelte-bxepaf");
    			add_location(p8, file$3, 43, 6, 940);
    			attr_dev(p9, "class", "svelte-bxepaf");
    			add_location(p9, file$3, 44, 6, 998);
    			attr_dev(div4, "class", "block svelte-bxepaf");
    			add_location(div4, file$3, 41, 4, 885);
    			attr_dev(div5, "class", "left svelte-bxepaf");
    			add_location(div5, file$3, 21, 2, 375);
    			attr_dev(h22, "class", "svelte-bxepaf");
    			add_location(h22, file$3, 49, 4, 1125);
    			attr_dev(h23, "class", "svelte-bxepaf");
    			add_location(h23, file$3, 51, 6, 1173);
    			attr_dev(p10, "class", "svelte-bxepaf");
    			add_location(p10, file$3, 52, 6, 1216);
    			attr_dev(div6, "class", "block svelte-bxepaf");
    			add_location(div6, file$3, 50, 4, 1147);
    			attr_dev(h24, "class", "svelte-bxepaf");
    			add_location(h24, file$3, 56, 6, 1273);
    			attr_dev(p11, "class", "svelte-bxepaf");
    			add_location(p11, file$3, 57, 6, 1312);
    			attr_dev(div7, "class", "block svelte-bxepaf");
    			add_location(div7, file$3, 55, 4, 1247);
    			attr_dev(h25, "class", "svelte-bxepaf");
    			add_location(h25, file$3, 61, 6, 1370);
    			attr_dev(p12, "class", "svelte-bxepaf");
    			add_location(p12, file$3, 62, 6, 1405);
    			attr_dev(div8, "class", "block svelte-bxepaf");
    			add_location(div8, file$3, 60, 4, 1344);
    			attr_dev(div9, "class", "middle svelte-bxepaf");
    			add_location(div9, file$3, 48, 2, 1100);
    			if (!src_url_equal(img1.src, img1_src_value = "/img/deco/creditsRight.svg")) attr_dev(img1, "src", img1_src_value);
    			attr_dev(img1, "alt", "");
    			add_location(img1, file$3, 67, 4, 1474);
    			attr_dev(div10, "class", "right arrow svelte-bxepaf");
    			add_location(div10, file$3, 66, 2, 1444);
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div3);
    			append_dev(div3, div2);
    			append_dev(div2, div0);
    			append_dev(div0, h20);
    			append_dev(div0, t1);
    			append_dev(div0, p0);
    			append_dev(div0, t3);
    			append_dev(div0, p1);
    			append_dev(div0, t5);
    			append_dev(div0, p2);
    			append_dev(div0, t7);
    			append_dev(div0, p3);
    			append_dev(div2, t9);
    			append_dev(div2, div1);
    			append_dev(div1, p4);
    			append_dev(p4, img0);
    			append_dev(p4, t10);
    			append_dev(div1, t11);
    			append_dev(div1, p5);
    			append_dev(div1, t13);
    			append_dev(div1, p6);
    			append_dev(div1, t15);
    			append_dev(div1, p7);
    			append_dev(div5, t17);
    			append_dev(div5, div4);
    			append_dev(div4, h21);
    			append_dev(div4, t19);
    			append_dev(div4, p8);
    			append_dev(div4, t21);
    			append_dev(div4, p9);
    			insert_dev(target, t23, anchor);
    			insert_dev(target, div9, anchor);
    			append_dev(div9, h22);
    			append_dev(div9, t25);
    			append_dev(div9, div6);
    			append_dev(div6, h23);
    			append_dev(div6, t27);
    			append_dev(div6, p10);
    			append_dev(div9, t29);
    			append_dev(div9, div7);
    			append_dev(div7, h24);
    			append_dev(div7, t31);
    			append_dev(div7, p11);
    			append_dev(div9, t33);
    			append_dev(div9, div8);
    			append_dev(div8, h25);
    			append_dev(div8, t35);
    			append_dev(div8, p12);
    			insert_dev(target, t37, anchor);
    			insert_dev(target, div10, anchor);
    			append_dev(div10, img1);

    			if (!mounted) {
    				dispose = listen_dev(img1, "click", /*click_handler_1*/ ctx[3], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);
    			if (detaching) detach_dev(t23);
    			if (detaching) detach_dev(div9);
    			if (detaching) detach_dev(t37);
    			if (detaching) detach_dev(div10);
    			mounted = false;
    			dispose();
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block$1.name,
    		type: "if",
    		source: "(20:2) {#if page === 1}",
    		ctx
    	});

    	return block;
    }

    function create_fragment$3(ctx) {
    	let div5;
    	let div0;
    	let t0;
    	let div3;
    	let h1;
    	let t2;
    	let div2;
    	let p;
    	let t4;
    	let div1;
    	let t5;
    	let div4;
    	let mounted;
    	let dispose;

    	function select_block_type(ctx, dirty) {
    		if (/*page*/ ctx[0] === 1) return create_if_block$1;
    		if (/*page*/ ctx[0] === 2) return create_if_block_1$1;
    	}

    	let current_block_type = select_block_type(ctx);
    	let if_block = current_block_type && current_block_type(ctx);

    	const block = {
    		c: function create() {
    			div5 = element("div");
    			div0 = element("div");
    			t0 = space();
    			div3 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Crédits";
    			t2 = space();
    			div2 = element("div");
    			p = element("p");
    			p.textContent = "Retour";
    			t4 = space();
    			div1 = element("div");
    			t5 = space();
    			div4 = element("div");
    			if (if_block) if_block.c();
    			attr_dev(div0, "class", "dark svelte-bxepaf");
    			add_location(div0, file$3, 7, 2, 109);
    			attr_dev(h1, "class", "svelte-bxepaf");
    			add_location(h1, file$3, 10, 4, 171);
    			attr_dev(p, "class", "svelte-bxepaf");
    			add_location(p, file$3, 12, 6, 219);
    			attr_dev(div1, "class", "underline svelte-bxepaf");
    			add_location(div1, file$3, 13, 6, 278);
    			attr_dev(div2, "class", "button svelte-bxepaf");
    			add_location(div2, file$3, 11, 4, 192);
    			attr_dev(div3, "class", "top font-cinzel svelte-bxepaf");
    			add_location(div3, file$3, 9, 2, 137);
    			attr_dev(div4, "class", "bottom svelte-bxepaf");
    			add_location(div4, file$3, 17, 2, 331);
    			attr_dev(div5, "class", "credits svelte-bxepaf");
    			add_location(div5, file$3, 6, 0, 85);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div5, anchor);
    			append_dev(div5, div0);
    			append_dev(div5, t0);
    			append_dev(div5, div3);
    			append_dev(div3, h1);
    			append_dev(div3, t2);
    			append_dev(div3, div2);
    			append_dev(div2, p);
    			append_dev(div2, t4);
    			append_dev(div2, div1);
    			append_dev(div5, t5);
    			append_dev(div5, div4);
    			if (if_block) if_block.m(div4, null);

    			if (!mounted) {
    				dispose = listen_dev(p, "click", /*click_handler*/ ctx[2], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			if (current_block_type === (current_block_type = select_block_type(ctx)) && if_block) {
    				if_block.p(ctx, dirty);
    			} else {
    				if (if_block) if_block.d(1);
    				if_block = current_block_type && current_block_type(ctx);

    				if (if_block) {
    					if_block.c();
    					if_block.m(div4, null);
    				}
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div5);

    			if (if_block) {
    				if_block.d();
    			}

    			mounted = false;
    			dispose();
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

    function instance$3($$self, $$props, $$invalidate) {
    	let $isCredits;
    	validate_store(isCredits, 'isCredits');
    	component_subscribe($$self, isCredits, $$value => $$invalidate(1, $isCredits = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Credits', slots, []);
    	let page = 1;
    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Credits> was created with unknown prop '${key}'`);
    	});

    	const click_handler = () => {
    		set_store_value(isCredits, $isCredits = false, $isCredits);
    	};

    	const click_handler_1 = () => {
    		$$invalidate(0, page = 2);
    	};

    	const click_handler_2 = () => {
    		$$invalidate(0, page = 1);
    	};

    	$$self.$capture_state = () => ({ isCredits, page, $isCredits });

    	$$self.$inject_state = $$props => {
    		if ('page' in $$props) $$invalidate(0, page = $$props.page);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [page, $isCredits, click_handler, click_handler_1, click_handler_2];
    }

    class Credits extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Credits",
    			options,
    			id: create_fragment$3.name
    		});
    	}
    }

    /* src/components/Final.svelte generated by Svelte v3.46.4 */
    const file$2 = "src/components/Final.svelte";

    function create_fragment$2(ctx) {
    	let div;
    	let p;

    	const block = {
    		c: function create() {
    			div = element("div");
    			p = element("p");
    			attr_dev(p, "class", "font-cinzel svelte-wikrvt");
    			add_location(p, file$2, 35, 2, 901);
    			attr_dev(div, "class", "final svelte-wikrvt");
    			add_location(div, file$2, 34, 0, 879);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, p);
    			/*p_binding*/ ctx[1](p);
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    			/*p_binding*/ ctx[1](null);
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
    	let $currentDialogIndex;
    	let $currentMusics;
    	validate_store(currentDialogIndex, 'currentDialogIndex');
    	component_subscribe($$self, currentDialogIndex, $$value => $$invalidate(2, $currentDialogIndex = $$value));
    	validate_store(currentMusics, 'currentMusics');
    	component_subscribe($$self, currentMusics, $$value => $$invalidate(3, $currentMusics = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('Final', slots, []);
    	set_store_value(currentMusics, $currentMusics = ["musicCitation"], $currentMusics);
    	let text = "“ La richesse d’une œuvre d’art est aussi un ensemble d’interprétations variées, à travers différents . . . „";
    	let arrText = text.split("");
    	let pText = null;

    	async function writeText() {
    		let spans = pText.querySelectorAll("span");

    		for (let i = 0; i < arrText.length; i++) {
    			await wait(100);
    			spans[i].style.opacity = 1;
    		}

    		await wait(2000);
    		set_store_value(currentDialogIndex, $currentDialogIndex = 0, $currentDialogIndex);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<Final> was created with unknown prop '${key}'`);
    	});

    	function p_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			pText = $$value;
    			$$invalidate(0, pText);
    		});
    	}

    	$$self.$capture_state = () => ({
    		wait,
    		currentDialogIndex,
    		currentMusics,
    		text,
    		arrText,
    		pText,
    		writeText,
    		$currentDialogIndex,
    		$currentMusics
    	});

    	$$self.$inject_state = $$props => {
    		if ('text' in $$props) text = $$props.text;
    		if ('arrText' in $$props) $$invalidate(5, arrText = $$props.arrText);
    		if ('pText' in $$props) $$invalidate(0, pText = $$props.pText);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*pText*/ 1) {
    			{
    				if (pText) {
    					for (const char of arrText) {
    						let span = document.createElement("span");
    						span.style.opacity = 0;
    						span.style.transition = "opacity 1s";
    						span.innerHTML = char;
    						pText.appendChild(span);
    					}

    					writeText();
    				}
    			}
    		}
    	};

    	return [pText, p_binding];
    }

    class Final extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Final",
    			options,
    			id: create_fragment$2.name
    		});
    	}
    }

    /* src/components/ConfirmMusic.svelte generated by Svelte v3.46.4 */
    const file$1 = "src/components/ConfirmMusic.svelte";

    function create_fragment$1(ctx) {
    	let div1;
    	let img;
    	let img_src_value;
    	let t0;
    	let p;
    	let t2;
    	let div0;
    	let mounted;
    	let dispose;

    	const block = {
    		c: function create() {
    			div1 = element("div");
    			img = element("img");
    			t0 = space();
    			p = element("p");
    			p.textContent = "Pour une meilleure expérience, munissez vous d’écouteurs.";
    			t2 = space();
    			div0 = element("div");
    			div0.textContent = "Compris";
    			if (!src_url_equal(img.src, img_src_value = "/img/deco/casque.png")) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", "");
    			attr_dev(img, "class", "svelte-u9g782");
    			add_location(img, file$1, 12, 2, 271);
    			attr_dev(p, "class", "font-montserrat svelte-u9g782");
    			add_location(p, file$1, 13, 2, 310);
    			attr_dev(div0, "class", "button font-montserrat svelte-u9g782");
    			add_location(div0, file$1, 14, 2, 401);
    			attr_dev(div1, "class", "confirmMusic svelte-u9g782");
    			add_location(div1, file$1, 11, 0, 242);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div1, anchor);
    			append_dev(div1, img);
    			append_dev(div1, t0);
    			append_dev(div1, p);
    			append_dev(div1, t2);
    			append_dev(div1, div0);

    			if (!mounted) {
    				dispose = listen_dev(div0, "click", /*handleClick*/ ctx[0], false, false, false);
    				mounted = true;
    			}
    		},
    		p: noop,
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div1);
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
    	let $confirmedMusic;
    	validate_store(confirmedMusic, 'confirmedMusic');
    	component_subscribe($$self, confirmedMusic, $$value => $$invalidate(1, $confirmedMusic = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('ConfirmMusic', slots, []);

    	function handleClick() {
    		if (typeof document.body.requestFullscreen == "function") {
    			document.body.requestFullscreen();
    		}

    		set_store_value(confirmedMusic, $confirmedMusic = true, $confirmedMusic);
    	}

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<ConfirmMusic> was created with unknown prop '${key}'`);
    	});

    	$$self.$capture_state = () => ({
    		confirmedMusic,
    		handleClick,
    		$confirmedMusic
    	});

    	return [handleClick];
    }

    class ConfirmMusic extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ConfirmMusic",
    			options,
    			id: create_fragment$1.name
    		});
    	}
    }

    /* src/App.svelte generated by Svelte v3.46.4 */

    const { Object: Object_1, window: window_1 } = globals;
    const file = "src/App.svelte";

    // (133:2) {:else}
    function create_else_block_1(ctx) {
    	let confirmmusic;
    	let current;
    	confirmmusic = new ConfirmMusic({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(confirmmusic.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(confirmmusic, target, anchor);
    			current = true;
    		},
    		p: noop,
    		i: function intro(local) {
    			if (current) return;
    			transition_in(confirmmusic.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(confirmmusic.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(confirmmusic, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_else_block_1.name,
    		type: "else",
    		source: "(133:2) {:else}",
    		ctx
    	});

    	return block;
    }

    // (123:2) {#if $confirmedMusic}
    function create_if_block_1(ctx) {
    	let current_block_type_index;
    	let if_block;
    	let if_block_anchor;
    	let current;
    	const if_block_creators = [create_if_block_2, create_if_block_3, create_if_block_4, create_else_block];
    	const if_blocks = [];

    	function select_block_type_1(ctx, dirty) {
    		if (/*$isAdventure*/ ctx[4]) return 0;
    		if (/*$isCredits*/ ctx[5]) return 1;
    		if (/*$currentDialogIndex*/ ctx[6] === dialogs.length - 1) return 2;
    		return 3;
    	}

    	current_block_type_index = select_block_type_1(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			if_block.c();
    			if_block_anchor = empty();
    		},
    		m: function mount(target, anchor) {
    			if_blocks[current_block_type_index].m(target, anchor);
    			insert_dev(target, if_block_anchor, anchor);
    			current = true;
    		},
    		p: function update(ctx, dirty) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type_1(ctx);

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
    				if_block.m(if_block_anchor.parentNode, if_block_anchor);
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
    			if_blocks[current_block_type_index].d(detaching);
    			if (detaching) detach_dev(if_block_anchor);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_1.name,
    		type: "if",
    		source: "(123:2) {#if $confirmedMusic}",
    		ctx
    	});

    	return block;
    }

    // (120:1) {#if mustTurn}
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
    		p: noop,
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
    		source: "(120:1) {#if mustTurn}",
    		ctx
    	});

    	return block;
    }

    // (130:3) {:else}
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
    		source: "(130:3) {:else}",
    		ctx
    	});

    	return block;
    }

    // (128:55) 
    function create_if_block_4(ctx) {
    	let final;
    	let current;
    	final = new Final({ $$inline: true });

    	const block = {
    		c: function create() {
    			create_component(final.$$.fragment);
    		},
    		m: function mount(target, anchor) {
    			mount_component(final, target, anchor);
    			current = true;
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(final.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(final.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			destroy_component(final, detaching);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_if_block_4.name,
    		type: "if",
    		source: "(128:55) ",
    		ctx
    	});

    	return block;
    }

    // (126:24) 
    function create_if_block_3(ctx) {
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
    		id: create_if_block_3.name,
    		type: "if",
    		source: "(126:24) ",
    		ctx
    	});

    	return block;
    }

    // (124:3) {#if $isAdventure}
    function create_if_block_2(ctx) {
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
    		id: create_if_block_2.name,
    		type: "if",
    		source: "(124:3) {#if $isAdventure}",
    		ctx
    	});

    	return block;
    }

    function create_fragment(ctx) {
    	let audio0;
    	let source0;
    	let source0_src_value;
    	let t0;
    	let audio1;
    	let source1;
    	let source1_src_value;
    	let t1;
    	let audio2;
    	let source2;
    	let source2_src_value;
    	let t2;
    	let audio3;
    	let source3;
    	let source3_src_value;
    	let t3;
    	let audio4;
    	let source4;
    	let source4_src_value;
    	let t4;
    	let audio5;
    	let source5;
    	let source5_src_value;
    	let t5;
    	let audio6;
    	let source6;
    	let source6_src_value;
    	let t6;
    	let audio7;
    	let source7;
    	let source7_src_value;
    	let t7;
    	let audio8;
    	let source8;
    	let source8_src_value;
    	let t8;
    	let audio9;
    	let source9;
    	let source9_src_value;
    	let t9;
    	let main;
    	let current_block_type_index;
    	let if_block;
    	let current;
    	let mounted;
    	let dispose;
    	const if_block_creators = [create_if_block, create_if_block_1, create_else_block_1];
    	const if_blocks = [];

    	function select_block_type(ctx, dirty) {
    		if (/*mustTurn*/ ctx[1]) return 0;
    		if (/*$confirmedMusic*/ ctx[3]) return 1;
    		return 2;
    	}

    	current_block_type_index = select_block_type(ctx);
    	if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

    	const block = {
    		c: function create() {
    			audio0 = element("audio");
    			source0 = element("source");
    			t0 = space();
    			audio1 = element("audio");
    			source1 = element("source");
    			t1 = space();
    			audio2 = element("audio");
    			source2 = element("source");
    			t2 = space();
    			audio3 = element("audio");
    			source3 = element("source");
    			t3 = space();
    			audio4 = element("audio");
    			source4 = element("source");
    			t4 = space();
    			audio5 = element("audio");
    			source5 = element("source");
    			t5 = space();
    			audio6 = element("audio");
    			source6 = element("source");
    			t6 = space();
    			audio7 = element("audio");
    			source7 = element("source");
    			t7 = space();
    			audio8 = element("audio");
    			source8 = element("source");
    			t8 = space();
    			audio9 = element("audio");
    			source9 = element("source");
    			t9 = space();
    			main = element("main");
    			if_block.c();
    			if (!src_url_equal(source0.src, source0_src_value = "/audio/1_-_Menu_-_click_(touche_clavier).mp3")) attr_dev(source0, "src", source0_src_value);
    			attr_dev(source0, "type", "audio/mpeg");
    			add_location(source0, file, 79, 1, 1678);
    			add_location(audio0, file, 78, 0, 1633);
    			if (!src_url_equal(source1.src, source1_src_value = "/audio/1_-_Menu_-_musique.mp3")) attr_dev(source1, "src", source1_src_value);
    			attr_dev(source1, "type", "audio/mpeg");
    			add_location(source1, file, 83, 1, 1809);
    			audio1.loop = true;
    			add_location(audio1, file, 82, 0, 1766);
    			if (!src_url_equal(source2.src, source2_src_value = "/audio/2_-_Musee_exterieur_-_ambiance_de_fond.mp3")) attr_dev(source2, "src", source2_src_value);
    			attr_dev(source2, "type", "audio/mpeg");
    			add_location(source2, file, 87, 1, 1937);
    			audio2.loop = true;
    			add_location(audio2, file, 86, 0, 1882);
    			if (!src_url_equal(source3.src, source3_src_value = "/audio/2_-_Musee_exterieur_-_musique.mp3")) attr_dev(source3, "src", source3_src_value);
    			attr_dev(source3, "type", "audio/mpeg");
    			add_location(source3, file, 91, 1, 2077);
    			audio3.loop = true;
    			add_location(audio3, file, 90, 0, 2030);
    			if (!src_url_equal(source4.src, source4_src_value = "/audio/3_-_Musee_-_ambiance_de_fond.mp3")) attr_dev(source4, "src", source4_src_value);
    			attr_dev(source4, "type", "audio/mpeg");
    			add_location(source4, file, 95, 1, 2213);
    			audio4.loop = true;
    			add_location(audio4, file, 94, 0, 2161);
    			if (!src_url_equal(source5.src, source5_src_value = "/audio/3_-_Musee_-_andre.mp3")) attr_dev(source5, "src", source5_src_value);
    			attr_dev(source5, "type", "audio/mpeg");
    			add_location(source5, file, 99, 1, 2340);
    			audio5.loop = true;
    			add_location(audio5, file, 98, 0, 2296);
    			if (!src_url_equal(source6.src, source6_src_value = "/audio/3_-_Musee_-_camille.mp3")) attr_dev(source6, "src", source6_src_value);
    			attr_dev(source6, "type", "audio/mpeg");
    			add_location(source6, file, 103, 1, 2458);
    			audio6.loop = true;
    			add_location(audio6, file, 102, 0, 2412);
    			if (!src_url_equal(source7.src, source7_src_value = "/audio/3_-_Musee_-_leo.mp3")) attr_dev(source7, "src", source7_src_value);
    			attr_dev(source7, "type", "audio/mpeg");
    			add_location(source7, file, 107, 1, 2574);
    			audio7.loop = true;
    			add_location(audio7, file, 106, 0, 2532);
    			if (!src_url_equal(source8.src, source8_src_value = "/audio/4_-_Fin_-_citation_-_musique.mp3")) attr_dev(source8, "src", source8_src_value);
    			attr_dev(source8, "type", "audio/mpeg");
    			add_location(source8, file, 111, 1, 2686);
    			add_location(audio8, file, 110, 0, 2644);
    			if (!src_url_equal(source9.src, source9_src_value = "/audio/4_-_Fin_-_sequence_intervenante_-_musique.mp3")) attr_dev(source9, "src", source9_src_value);
    			attr_dev(source9, "type", "audio/mpeg");
    			add_location(source9, file, 115, 1, 2820);
    			audio9.loop = true;
    			add_location(audio9, file, 114, 0, 2769);
    			attr_dev(main, "class", "svelte-17503q8");
    			add_location(main, file, 118, 0, 2916);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, audio0, anchor);
    			append_dev(audio0, source0);
    			/*audio0_binding*/ ctx[10](audio0);
    			insert_dev(target, t0, anchor);
    			insert_dev(target, audio1, anchor);
    			append_dev(audio1, source1);
    			/*audio1_binding*/ ctx[11](audio1);
    			insert_dev(target, t1, anchor);
    			insert_dev(target, audio2, anchor);
    			append_dev(audio2, source2);
    			/*audio2_binding*/ ctx[12](audio2);
    			insert_dev(target, t2, anchor);
    			insert_dev(target, audio3, anchor);
    			append_dev(audio3, source3);
    			/*audio3_binding*/ ctx[13](audio3);
    			insert_dev(target, t3, anchor);
    			insert_dev(target, audio4, anchor);
    			append_dev(audio4, source4);
    			/*audio4_binding*/ ctx[14](audio4);
    			insert_dev(target, t4, anchor);
    			insert_dev(target, audio5, anchor);
    			append_dev(audio5, source5);
    			/*audio5_binding*/ ctx[15](audio5);
    			insert_dev(target, t5, anchor);
    			insert_dev(target, audio6, anchor);
    			append_dev(audio6, source6);
    			/*audio6_binding*/ ctx[16](audio6);
    			insert_dev(target, t6, anchor);
    			insert_dev(target, audio7, anchor);
    			append_dev(audio7, source7);
    			/*audio7_binding*/ ctx[17](audio7);
    			insert_dev(target, t7, anchor);
    			insert_dev(target, audio8, anchor);
    			append_dev(audio8, source8);
    			/*audio8_binding*/ ctx[18](audio8);
    			insert_dev(target, t8, anchor);
    			insert_dev(target, audio9, anchor);
    			append_dev(audio9, source9);
    			/*audio9_binding*/ ctx[19](audio9);
    			insert_dev(target, t9, anchor);
    			insert_dev(target, main, anchor);
    			if_blocks[current_block_type_index].m(main, null);
    			current = true;

    			if (!mounted) {
    				dispose = listen_dev(window_1, "resize", /*checkScreen*/ ctx[7], false, false, false);
    				mounted = true;
    			}
    		},
    		p: function update(ctx, [dirty]) {
    			let previous_block_index = current_block_type_index;
    			current_block_type_index = select_block_type(ctx);

    			if (current_block_type_index === previous_block_index) {
    				if_blocks[current_block_type_index].p(ctx, dirty);
    			} else {
    				group_outros();

    				transition_out(if_blocks[previous_block_index], 1, 1, () => {
    					if_blocks[previous_block_index] = null;
    				});

    				check_outros();
    				if_block = if_blocks[current_block_type_index];

    				if (!if_block) {
    					if_block = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
    					if_block.c();
    				} else {
    					if_block.p(ctx, dirty);
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
    			if (detaching) detach_dev(audio0);
    			/*audio0_binding*/ ctx[10](null);
    			if (detaching) detach_dev(t0);
    			if (detaching) detach_dev(audio1);
    			/*audio1_binding*/ ctx[11](null);
    			if (detaching) detach_dev(t1);
    			if (detaching) detach_dev(audio2);
    			/*audio2_binding*/ ctx[12](null);
    			if (detaching) detach_dev(t2);
    			if (detaching) detach_dev(audio3);
    			/*audio3_binding*/ ctx[13](null);
    			if (detaching) detach_dev(t3);
    			if (detaching) detach_dev(audio4);
    			/*audio4_binding*/ ctx[14](null);
    			if (detaching) detach_dev(t4);
    			if (detaching) detach_dev(audio5);
    			/*audio5_binding*/ ctx[15](null);
    			if (detaching) detach_dev(t5);
    			if (detaching) detach_dev(audio6);
    			/*audio6_binding*/ ctx[16](null);
    			if (detaching) detach_dev(t6);
    			if (detaching) detach_dev(audio7);
    			/*audio7_binding*/ ctx[17](null);
    			if (detaching) detach_dev(t7);
    			if (detaching) detach_dev(audio8);
    			/*audio8_binding*/ ctx[18](null);
    			if (detaching) detach_dev(t8);
    			if (detaching) detach_dev(audio9);
    			/*audio9_binding*/ ctx[19](null);
    			if (detaching) detach_dev(t9);
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
    	let $currentMusics;
    	let $soundEffects;
    	let $confirmedMusic;
    	let $isAdventure;
    	let $isCredits;
    	let $currentDialogIndex;
    	validate_store(currentMusics, 'currentMusics');
    	component_subscribe($$self, currentMusics, $$value => $$invalidate(9, $currentMusics = $$value));
    	validate_store(soundEffects, 'soundEffects');
    	component_subscribe($$self, soundEffects, $$value => $$invalidate(2, $soundEffects = $$value));
    	validate_store(confirmedMusic, 'confirmedMusic');
    	component_subscribe($$self, confirmedMusic, $$value => $$invalidate(3, $confirmedMusic = $$value));
    	validate_store(isAdventure, 'isAdventure');
    	component_subscribe($$self, isAdventure, $$value => $$invalidate(4, $isAdventure = $$value));
    	validate_store(isCredits, 'isCredits');
    	component_subscribe($$self, isCredits, $$value => $$invalidate(5, $isCredits = $$value));
    	validate_store(currentDialogIndex, 'currentDialogIndex');
    	component_subscribe($$self, currentDialogIndex, $$value => $$invalidate(6, $currentDialogIndex = $$value));
    	let { $$slots: slots = {}, $$scope } = $$props;
    	validate_slots('App', slots, []);

    	let audios = {
    		musicMenu: null,
    		musicMuseeExtAmbiance: null,
    		musicMuseeExt: null,
    		musicMuseeAmbiance: null,
    		musicAndre: null,
    		musicCamille: null,
    		musicLeo: null,
    		musicCitation: null,
    		musicIntervenante: null
    	};

    	let audiosReady = false;
    	let mustTurn;
    	checkScreen();

    	function checkScreen() {
    		let vh = window.innerHeight * 0.01;
    		document.documentElement.style.setProperty('--vh', `${vh}px`);

    		if (window.innerHeight > window.innerWidth) {
    			$$invalidate(1, mustTurn = true);
    		} else {
    			$$invalidate(1, mustTurn = false);
    		}
    	}

    	const writable_props = [];

    	Object_1.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== '$$' && key !== 'slot') console.warn(`<App> was created with unknown prop '${key}'`);
    	});

    	function audio0_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			$soundEffects.menuClick = $$value;
    			soundEffects.set($soundEffects);
    		});
    	}

    	function audio1_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			audios.musicMenu = $$value;
    			$$invalidate(0, audios);
    		});
    	}

    	function audio2_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			audios.musicMuseeExtAmbiance = $$value;
    			$$invalidate(0, audios);
    		});
    	}

    	function audio3_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			audios.musicMuseeExt = $$value;
    			$$invalidate(0, audios);
    		});
    	}

    	function audio4_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			audios.musicMuseeAmbiance = $$value;
    			$$invalidate(0, audios);
    		});
    	}

    	function audio5_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			audios.musicAndre = $$value;
    			$$invalidate(0, audios);
    		});
    	}

    	function audio6_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			audios.musicCamille = $$value;
    			$$invalidate(0, audios);
    		});
    	}

    	function audio7_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			audios.musicLeo = $$value;
    			$$invalidate(0, audios);
    		});
    	}

    	function audio8_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			audios.musicCitation = $$value;
    			$$invalidate(0, audios);
    		});
    	}

    	function audio9_binding($$value) {
    		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
    			audios.musicIntervenante = $$value;
    			$$invalidate(0, audios);
    		});
    	}

    	$$self.$capture_state = () => ({
    		Adventure,
    		PleaseTurn,
    		HomePage,
    		Credits,
    		Final,
    		ConfirmMusic,
    		isAdventure,
    		isCredits,
    		currentDialogIndex,
    		confirmedMusic,
    		currentMusics,
    		soundEffects,
    		audioFadeIn,
    		audioFadeOut,
    		dialogs,
    		audios,
    		audiosReady,
    		mustTurn,
    		checkScreen,
    		$currentMusics,
    		$soundEffects,
    		$confirmedMusic,
    		$isAdventure,
    		$isCredits,
    		$currentDialogIndex
    	});

    	$$self.$inject_state = $$props => {
    		if ('audios' in $$props) $$invalidate(0, audios = $$props.audios);
    		if ('audiosReady' in $$props) $$invalidate(8, audiosReady = $$props.audiosReady);
    		if ('mustTurn' in $$props) $$invalidate(1, mustTurn = $$props.mustTurn);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*audios*/ 1) {
    			{
    				const entries = Object.entries(audios);
    				let i;

    				for (i = 0; i < entries.length; i++) {
    					if (!entries[i][1]) {
    						break;
    					}
    				}

    				if (i === entries.length) {
    					$$invalidate(8, audiosReady = true);
    				}
    			}
    		}

    		if ($$self.$$.dirty & /*audiosReady, audios, $currentMusics*/ 769) {
    			{
    				if (audiosReady) {
    					for (const [audioName, audio] of Object.entries(audios)) {
    						if ($currentMusics.includes(audioName)) {
    							if (audio.paused) {
    								audioFadeIn(audio);
    							}
    						} else {
    							if (!audio.paused) {
    								audioFadeOut(audio);
    							}
    						}
    					}
    				}
    			}
    		}
    	};

    	return [
    		audios,
    		mustTurn,
    		$soundEffects,
    		$confirmedMusic,
    		$isAdventure,
    		$isCredits,
    		$currentDialogIndex,
    		checkScreen,
    		audiosReady,
    		$currentMusics,
    		audio0_binding,
    		audio1_binding,
    		audio2_binding,
    		audio3_binding,
    		audio4_binding,
    		audio5_binding,
    		audio6_binding,
    		audio7_binding,
    		audio8_binding,
    		audio9_binding
    	];
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
