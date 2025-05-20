///|
typealias @respo_node.(RespoEvent, RespoNode, DispatchFn, RespoCommonError)

///|
fnalias @respo_node.(text_node, textarea, declare_static_style)

///|
fnalias @respo.ui_textarea

///|
struct ContainerState {
  draft : String
} derive(Default, ToJson, @json.FromJson)

///|
fn comp_container(states : @respo.RespoStatesTree) -> RespoNode[ActionOp] {
  let cursor = states.path()
  let state = (states.cast_branch() : ContainerState)
  div([
    div([
      textarea(
        class_list=[ui_textarea, style_textbox],
        placeholder="Question",
        value=state.draft,
        event=Map::of([
          (
            Input,
            fn(e, dispatch) {
              if e is Input(value~, ..) {
                dispatch.set_state!(cursor, ContainerState::{ draft: value })
              }
            },
          ),
          (
            Keydown,
            fn(e, dispatch) {
              if e is Keyboard(key_code~, meta_key~, ..) {
                if key_code == 13 && meta_key {
                  ask_gemini(state.draft)
                }
              }
            },
          ),
        ]),
      ),
      button(
        inner_text="Ask",
        class_name=ui_button,
        style=respo_style(margin=4 |> Px),
        event={}..set(Click, fn(e, dispatch) { ask_gemini(state.draft) }),
      ),
    ]),
  ])
}

///|
let style_textbox : String = declare_static_style([
  ("&", respo_style(width=600 |> Px, height=160 |> Px)),
])
