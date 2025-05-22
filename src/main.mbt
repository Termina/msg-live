///|
fnalias @respo.(ui_global, ui_button)

///|
fnalias @respo_node.(div, button, respo_style)

///|
let app_store_key : String = "mbt-workflow"

///|
extern "js" fn register_gemini_ask() -> Unit =
  #| () => {};
  #| import "/src/control.mjs";

///|
extern "js" fn ask_gemini(msg : String) -> Unit =
  #| (msg) => { window.ask_gemini(msg); };

///|
fn view(
  store : Store
) -> @respo_node.RespoNode[ActionOp]!@respo_node.RespoCommonError {
  if false {
    raise @respo_node.RespoCommonError("TODO")
  }
  // @dom_ffi.log("Store to render: " + store.to_json().stringify(indent=2))
  let states = store.get_states()
  div(class_name=ui_global, style=respo_style(padding=Px(12)), [
    comp_container(states.pick("container")),
  ])
}

///|
fn main {
  register_gemini_ask()
  let window = @dom_ffi.window()
  let mount_target = window
    .document()
    .query_selector(".app")
    .reinterpret_as_node()
  let app : @respo.RespoApp[Store] = {
    store: Ref::new(@respo.try_load_storage(app_store_key)),
    mount_target,
    storage_key: app_store_key,
  }
  app.backup_model_beforeunload()
  // @dom_ffi.log("store: " + app.store.val.to_json().stringify(indent=2))
  app.render_loop(fn() { view!(app.store.val) }, fn(op) {
    if op is StatesChange(_) {

    } else {
      @dom_ffi.log("op: \{op}")
    }
    app.store.val.update(op)
  })
  let dev_mode = @dom_ffi.new_url_search_params(window.location().search()).get(
    "mode",
  )
  @dom_ffi.log("dev mode: " + dev_mode.to_string())
}
