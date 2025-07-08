from gevent import monkey

# If the entrypoint is called – it'll be already patched while reaching this state
#  – no need to patch twice
if not monkey.is_module_patched("ssl"):
    print("Monkey patching for gevent worker")
    monkey.patch_all()
