using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Linq;
using CmdManager.Data;
using CmdManager.Models;

namespace CmdManager.ViewModels
{
    public class AppViewModel : INotifyPropertyChanged
    {
        private AppData _data;

        public ObservableCollection<Command> Commands         { get; } = new();
        public ObservableCollection<CommandChain> Chains      { get; } = new();
        public ObservableCollection<Command> RegistryCommands { get; } = new();
        public ObservableCollection<Group> Groups             { get; } = new();

        public AppViewModel(AppData data)
        {
            _data = data;
            Reload();
        }

        public void Reload()
        {
            Commands.Clear();
            Chains.Clear();
            RegistryCommands.Clear();
            Groups.Clear();

            foreach (var c in _data.Commands)         Commands.Add(c);
            foreach (var c in _data.Chains)           Chains.Add(c);
            foreach (var c in _data.RegistryCommands) RegistryCommands.Add(c);
            foreach (var g in _data.Groups)            Groups.Add(g);
        }

        public void AddCommand(Command cmd)
        {
            _data.Commands.Add(cmd);
            Commands.Add(cmd);
            Save();
        }

        public void UpdateCommand(Command cmd)
        {
            var idx = _data.Commands.FindIndex(c => c.Id == cmd.Id);
            if (idx >= 0) { _data.Commands[idx] = cmd; Reload(); Save(); }
        }

        public void DeleteCommand(string id)
        {
            _data.Commands.RemoveAll(c => c.Id == id);
            foreach (var g in _data.Groups) g.CommandIds.Remove(id);
            Reload(); Save();
        }

        public void AddChain(CommandChain chain)
        {
            _data.Chains.Add(chain);
            Chains.Add(chain);
            Save();
        }

        public void UpdateChain(CommandChain chain)
        {
            var idx = _data.Chains.FindIndex(c => c.Id == chain.Id);
            if (idx >= 0) { _data.Chains[idx] = chain; Reload(); Save(); }
        }

        public void DeleteChain(string id)
        {
            _data.Chains.RemoveAll(c => c.Id == id);
            foreach (var g in _data.Groups) g.ChainIds.Remove(id);
            Reload(); Save();
        }

        public void AddRegistryCommand(Command cmd)
        {
            _data.RegistryCommands.Add(cmd);
            RegistryCommands.Add(cmd);
            Save();
        }

        public void UpdateRegistryCommand(Command cmd)
        {
            var idx = _data.RegistryCommands.FindIndex(c => c.Id == cmd.Id);
            if (idx >= 0) { _data.RegistryCommands[idx] = cmd; Reload(); Save(); }
        }

        public void DeleteRegistryCommand(string id)
        {
            _data.RegistryCommands.RemoveAll(c => c.Id == id);
            foreach (var g in _data.Groups) g.RegistryIds.Remove(id);
            Reload(); Save();
        }

        public void AddGroup(Group group)
        {
            _data.Groups.Add(group);
            Groups.Add(group);
            Save();
        }

        public void UpdateGroup(Group group)
        {
            var idx = _data.Groups.FindIndex(g => g.Id == group.Id);
            if (idx >= 0) { _data.Groups[idx] = group; Reload(); Save(); }
        }

        public void DeleteGroup(string id)
        {
            _data.Groups.RemoveAll(g => g.Id == id);
            Reload(); Save();
        }

        private void Save() => Store.Save(_data);

        public event PropertyChangedEventHandler? PropertyChanged;
    }
}
