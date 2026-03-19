using System.Collections.Generic;

namespace CmdManager.Models
{
    public class Command
    {
        public string Id { get; set; } = "";
        public string Name { get; set; } = "";
        public string Description { get; set; } = "";
        public string CommandText { get; set; } = "";
        public bool RequiresAdmin { get; set; }
        public string Category { get; set; } = "";
        public string Shell { get; set; } = "both";
    }

    public class CommandChainStep
    {
        public string Id { get; set; } = "";
        public string Prefix { get; set; } = "";
        public string CommandText { get; set; } = "";
    }

    public class CommandChain
    {
        public string Id { get; set; } = "";
        public string Name { get; set; } = "";
        public string Description { get; set; } = "";
        public List<CommandChainStep> Steps { get; set; } = new();
        public string Category { get; set; } = "";
        public string Shell { get; set; } = "both";
    }

    public class Group
    {
        public string Id { get; set; } = "";
        public string Name { get; set; } = "";
        public string Description { get; set; } = "";
        public List<string> CommandIds { get; set; } = new();
        public List<string> ChainIds { get; set; } = new();
        public List<string> RegistryIds { get; set; } = new();
    }

    public class AppData
    {
        public int Version { get; set; } = 1;
        public List<Command> Commands { get; set; } = new();
        public List<CommandChain> Chains { get; set; } = new();
        public List<Command> RegistryCommands { get; set; } = new();
        public List<Group> Groups { get; set; } = new();
    }
}
