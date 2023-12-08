import { loadResource } from "../../static/utils/resources.js";

export default {
  template: "<div></div>",
  props: {
    map_options: Object,
    resource_path: String,
  },
  async mounted() {
    await this.$nextTick(); // NOTE: wait for window.path_prefix to be set
    const promisses = [
      loadResource(window.path_prefix + `${this.resource_path}/leaflet/leaflet.css`),
      loadResource(window.path_prefix + `${this.resource_path}/leaflet/leaflet.js`),
    ];
    if (this.map_options.drawControl) {
      promisses.push(loadResource(window.path_prefix + `${this.resource_path}/leaflet-draw/leaflet.draw.css`));
      promisses.push(loadResource(window.path_prefix + `${this.resource_path}/leaflet-draw/leaflet.draw.js`));
    }
    await Promise.all(promisses);
    this.map = L.map(this.$el, this.map_options);
    this.map.on("moveend", (e) => this.$emit("moveend", e.target.getCenter()));
    this.map.on("zoomend", (e) => this.$emit("zoomend", e.target.getZoom()));
    if (this.map_options.drawControl) {
      var drawnItems = new L.FeatureGroup();
      this.map.addLayer(drawnItems);
    }
    const connectInterval = setInterval(async () => {
      if (window.socket.id === undefined) return;
      this.$emit("init", { socket_id: window.socket.id });
      clearInterval(connectInterval);
    }, 100);
  },
  updated() {
    this.map.setView(L.latLng(this.map_options.center.lat, this.map_options.center.lng), this.map_options.zoom);
  },
  methods: {
    add_layer(layer) {
      L[layer.type](...layer.args).addTo(this.map);
    },
  },
};
