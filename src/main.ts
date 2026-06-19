import { createApp } from 'vue'
import { createPinia } from 'pinia'
import {
  Avatar,
  Badge,
  Button,
  Checkbox,
  Col,
  Collapse,
  Comment,
  ConfigProvider,
  DatePicker,
  Dropdown,
  Form,
  Input,
  Layout,
  List,
  Menu,
  Modal,
  Row,
  Segmented,
  Select,
  Space,
  Table,
  Tag,
} from 'ant-design-vue'
import App from './App.vue'
import 'ant-design-vue/dist/reset.css'

const app = createApp(App)

app.use(createPinia())

const antComponents = [
  Avatar,
  Badge,
  Button,
  Checkbox,
  Col,
  Collapse,
  Comment,
  ConfigProvider,
  DatePicker,
  Dropdown,
  Form,
  Input,
  Layout,
  List,
  Menu,
  Modal,
  Row,
  Segmented,
  Select,
  Space,
  Table,
  Tag,
]

antComponents.forEach((component) => app.use(component))

app.mount('#app')
