/**
 * 原有待办练习，通过 src/app/todos.tsx 映射到 /todos。
 * 练习 useState、受控输入、数组不可变更新、FlatList 和点击事件。
 * 待办只存于组件内存：页面卸载后会重置，与持久化的文章收藏不同。
 */
import { useRef, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  SafeAreaProvider,
  SafeAreaView,
} from 'react-native-safe-area-context';

// 一条待办的数据结构：稳定的字符串 ID、输入的标题、是否已完成。
type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

function TodoScreen() {
  // input 驱动输入框；todos 驱动列表。调用 setter 后 React 会重新渲染。
  const [input, setInput] = useState('');
  const [todos, setTodos] = useState<Todo[]>([]);
  // 编号计数不参与显示，用 ref 跨渲染保存；当前页面实例内从 1 开始递增。
  const nextId = useRef(0);

  // 未完成数量可以由 todos 推导，不额外维护一个容易失去同步的 state。
  const remaining = todos.filter(todo => !todo.completed).length;

  function addTodo() {
    // 去掉首尾空白，纯空格输入直接退出，防止创建没有内容的待办。
    const title = input.trim();

    if (!title) return;

    const todo: Todo = {
      // 先递增再转换成字符串，供 FlatList 的 keyExtractor 使用。
      id: String(++nextId.current),
      title,
      completed: false,
    };

    // 函数式更新获得最新数组；展开运算符生成新数组，新待办排到最前面。
    setTodos(current => [todo, ...current]);
    // 清空受控输入框，方便继续输入下一项。
    setInput('');
  }

  function toggleTodo(id: string) {
    // map 保留列表顺序，只替换匹配 ID 的对象；! 将完成状态取反。
    // 其他项沿用原对象，不直接修改旧数组/对象，React 能据此正确更新界面。
    setTodos(current =>
      current.map(todo =>
        todo.id === id
          ? { ...todo, completed: !todo.completed }
          : todo,
      ),
    );
  }

  function removeTodo(id: string) {
    // filter 返回排除了目标项的新数组，原数组保持不变。
    setTodos(current => current.filter(todo => todo.id !== id));
  }

  return (
    <SafeAreaView style={styles.screen}>
      {/* 安全区域容器避开系统遮挡；标题和统计都随着 state 自动更新。 */}
      <Text style={styles.heading}>我的待办</Text>
      <Text style={styles.subtitle}>还有 {remaining} 项未完成</Text>

      <View style={styles.inputRow}>
        {/* 受控输入：value 来自 input，用户输入经 onChangeText 写回 state。
            键盘完成键和右侧按钮都调用 addTodo，复用同一套校验和添加逻辑。 */}
        <TextInput
          style={styles.input}
          value={input}
          onChangeText={setInput}
          placeholder="接下来做什么？"
          placeholderTextColor="#64748b"
          returnKeyType="done"
          onSubmitEditing={addTodo}
          accessibilityLabel="待办内容"
        />

        {/* 空白输入禁用按钮；pressed 只在按压期间为 true，用透明度提供反馈。 */}
        <Pressable
          accessibilityRole="button"
          disabled={!input.trim()}
          onPress={addTodo}
          style={({ pressed }) => [
            styles.addButton,
            !input.trim() && styles.disabled,
            pressed && styles.pressed,
          ]}
        >
          <Text style={styles.addButtonText}>添加</Text>
        </Pressable>
      </View>

      {/* FlatList 根据 data 渲染待办；稳定 ID 帮助 React 正确关联每一项。
          keyboardShouldPersistTaps="handled" 让已处理的点击不被收键盘吞掉。
          ListEmptyComponent 在数组为空时显示；renderItem 定义每项的界面。 */}
      <FlatList
        style={styles.list}
        data={todos}
        keyExtractor={item => item.id}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.empty}>还没有待办，添加第一项吧。</Text>
        }
        renderItem={({ item }) => (
          <View style={styles.todoRow}>
            {/* 主体区域切换完成状态。checkbox 和 checked 让辅助技术读出勾选状态。 */}
            <Pressable
              style={styles.todoBody}
              onPress={() => toggleTodo(item.id)}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: item.completed }}
              accessibilityLabel={item.title}
            >
              <Text
                style={[
                  styles.todoTitle,
                  item.completed && styles.completed,
                ]}
              >
                {/* 图标、灰色和删除线共同反馈完成状态，实际状态来自 item.completed。 */}
                {item.completed ? '✓ ' : '○ '}
                {item.title}
              </Text>
            </Pressable>

            {/* 删除区域与勾选区域并列，点击删除只触发 removeTodo。 */}
            <Pressable
              style={styles.deleteButton}
              onPress={() => removeTodo(item.id)}
              accessibilityRole="button"
              accessibilityLabel={`删除${item.title}`}
            >
              <Text style={styles.deleteText}>删除</Text>
            </Pressable>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

export default function App() {
  // 保留原组件的安全区域 Provider，供 TodoScreen 内的 SafeAreaView 读取边距。
  return (
    <SafeAreaProvider>
      <TodoScreen />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  // 页面占满可用区域，左右各留 20；颜色统一使用浅背景与深色正文。
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#f8fafc',
  },
  // 标题与统计文案通过字号、字重和上下间距区分层级。
  heading: {
    marginTop: 20,
    fontSize: 28,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    marginTop: 8,
    marginBottom: 24,
    color: '#64748b',
  },
  // 横向布局放置输入框与按钮；gap 控制两者间距。
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  // flex: 1 占用按钮之外的剩余宽度；最小高度保证输入区域方便点击。
  input: {
    flex: 1,
    minHeight: 48,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 10,
    backgroundColor: '#ffffff',
    color: '#0f172a',
  },
  // 按钮文字垂直居中；paddingHorizontal 提供左右可点击空间。
  addButton: {
    justifyContent: 'center',
    paddingHorizontal: 18,
    borderRadius: 10,
    backgroundColor: '#2563eb',
  },
  addButtonText: {
    color: '#ffffff',
    fontWeight: '600',
  },
  // 状态样式通过数组叠加：禁用时更淡，按下时稍微变淡。
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.7,
  },
  // 列表填满输入行下方剩余区域，内部底部留白避免最后一项贴底。
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  // 每行是白色圆角卡片，主体与删除按钮横向排列、垂直居中。
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  // 主体吃掉剩余宽度，并保证 48 的点击高度。
  todoBody: {
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
  },
  // 普通正文为深色；完成项叠加浅色与删除线，但仍保留内容便于回看。
  todoTitle: {
    fontSize: 16,
    color: '#0f172a',
  },
  completed: {
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  // 删除按钮单独设置点击空间，文字红色强调删除操作。
  deleteButton: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  deleteText: {
    color: '#dc2626',
  },
  // 空列表提示居中显示，通过上边距与输入区域分开。
  empty: {
    marginTop: 40,
    textAlign: 'center',
    color: '#64748b',
  },
});
