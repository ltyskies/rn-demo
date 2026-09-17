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

type Todo = {
  id: string;
  title: string;
  completed: boolean;
};

function TodoScreen() {
  const [input, setInput] = useState('');
  const [todos, setTodos] = useState<Todo[]>([]);
  const nextId = useRef(0);

  const remaining = todos.filter(todo => !todo.completed).length;

  function addTodo() {
    const title = input.trim();

    if (!title) return;

    const todo: Todo = {
      id: String(++nextId.current),
      title,
      completed: false,
    };

    setTodos(current => [todo, ...current]);
    setInput('');
  }

  function toggleTodo(id: string) {
    setTodos(current =>
      current.map(todo =>
        todo.id === id
          ? { ...todo, completed: !todo.completed }
          : todo,
      ),
    );
  }

  function removeTodo(id: string) {
    setTodos(current => current.filter(todo => todo.id !== id));
  }

  return (
    <SafeAreaView style={styles.screen}>
      <Text style={styles.heading}>我的待办</Text>
      <Text style={styles.subtitle}>还有 {remaining} 项未完成</Text>

      <View style={styles.inputRow}>
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
                {item.completed ? '✓ ' : '○ '}
                {item.title}
              </Text>
            </Pressable>

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
  return (
    <SafeAreaProvider>
      <TodoScreen />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    paddingHorizontal: 20,
    backgroundColor: '#f8fafc',
  },
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
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
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
  disabled: {
    opacity: 0.4,
  },
  pressed: {
    opacity: 0.7,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 24,
  },
  todoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    borderRadius: 10,
    backgroundColor: '#ffffff',
  },
  todoBody: {
    flex: 1,
    minHeight: 48,
    justifyContent: 'center',
  },
  todoTitle: {
    fontSize: 16,
    color: '#0f172a',
  },
  completed: {
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  deleteButton: {
    minHeight: 48,
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  deleteText: {
    color: '#dc2626',
  },
  empty: {
    marginTop: 40,
    textAlign: 'center',
    color: '#64748b',
  },
});